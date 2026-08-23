const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createCRC32Table() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const typeBuf = Buffer.from(type, "ascii");
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  typeBuf.copy(buf, 4);
  data.copy(buf, 8);
  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  const rawScanlines = Buffer.alloc(height * (width * 4 + 1));
  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = width * 0.22;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines.writeUInt8(0, offset++);

    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const innerW = cx - cornerRadius;
      const innerH = cy - cornerRadius;

      let inBox = false;
      if (dx <= innerW && dy <= cy) inBox = true;
      else if (dx <= cx && dy <= innerH) inBox = true;
      else {
        const cornerDx = dx - innerW;
        const cornerDy = dy - innerH;
        if (cornerDx * cornerDx + cornerDy * cornerDy <= cornerRadius * cornerRadius) {
          inBox = true;
        }
      }

      let r = 234, g = 88, b = 12, a = 255;

      if (!inBox) {
        r = 15; g = 23; b = 42; a = 255;
      } else {
        const grad = (y / height) * 35;
        r = Math.max(0, Math.min(255, 234 - grad * 0.5));
        g = Math.max(0, Math.min(255, 88 - grad * 0.8));
        b = Math.max(0, Math.min(255, 12));

        const distFromCenter = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        const outerR = width * 0.28;
        const innerR = width * 0.16;
        const inRing = distFromCenter <= outerR && distFromCenter >= innerR;
        const angle = Math.atan2(y - cy, x - cx);

        const inGap = angle > -0.6 && angle < 0.6;

        if (inRing && !inGap) {
          r = 255; g = 255; b = 255; a = 255;
        }

        const dotDist = Math.sqrt((x - (cx + width * 0.08)) * (x - (cx + width * 0.08)) + (y - cy) * (y - cy));
        if (dotDist <= width * 0.04) {
          r = 251; g = 191; b = 36; a = 255;
        }
      }

      rawScanlines.writeUInt8(Math.round(r), offset);
      rawScanlines.writeUInt8(Math.round(g), offset + 1);
      rawScanlines.writeUInt8(Math.round(b), offset + 2);
      rawScanlines.writeUInt8(Math.round(a), offset + 3);
      offset += 4;
    }
  }

  const idatCompressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk("IDAT", idatCompressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const icon192 = generatePng(192, 192);
fs.writeFileSync(path.join(publicDir, "icon-192.png"), icon192);
console.log("Created public/icon-192.png:", icon192.length, "bytes");

const icon512 = generatePng(512, 512);
fs.writeFileSync(path.join(publicDir, "icon-512.png"), icon512);
console.log("Created public/icon-512.png:", icon512.length, "bytes");
