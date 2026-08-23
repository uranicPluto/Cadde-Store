export const TURKISH_CARRIERS = [
  "Yurtiçi Kargo",
  "Aras Kargo",
  "MNG Kargo",
  "Sürat Kargo",
  "PTT Kargo",
  "HepsiJet",
] as const;

export type TurkishCarrier = (typeof TURKISH_CARRIERS)[number];

export interface CarrierInfo {
  name: TurkishCarrier;
  code: string;
  website: string;
  customerService: string;
  trackingPlaceholder: string;
  samplePrefix: string;
}

export const CARRIER_REGISTRY: Record<TurkishCarrier, CarrierInfo> = {
  "Yurtiçi Kargo": {
    name: "Yurtiçi Kargo",
    code: "YRT",
    website: "https://www.yurticikargo.com",
    customerService: "444 99 99",
    trackingPlaceholder: "Örn: YRT-948201948 veya 12 haneli kod",
    samplePrefix: "YRT",
  },
  "Aras Kargo": {
    name: "Aras Kargo",
    code: "ARS",
    website: "https://www.araskargo.com.tr",
    customerService: "444 25 52",
    trackingPlaceholder: "Örn: ARS-883920194 veya 13 haneli takip no",
    samplePrefix: "ARS",
  },
  "MNG Kargo": {
    name: "MNG Kargo",
    code: "MNG",
    website: "https://www.mngkargo.com.tr",
    customerService: "0850 222 06 06",
    trackingPlaceholder: "Örn: MNG-552019482 veya 10 haneli takip no",
    samplePrefix: "MNG",
  },
  "Sürat Kargo": {
    name: "Sürat Kargo",
    code: "SRT",
    website: "https://suratkargo.com.tr",
    customerService: "0850 202 02 02",
    trackingPlaceholder: "Örn: SRT-110294820 veya 12 haneli barkod",
    samplePrefix: "SRT",
  },
  "PTT Kargo": {
    name: "PTT Kargo",
    code: "PTT",
    website: "https://gonderitakip.ptt.gov.tr",
    customerService: "444 1 788",
    trackingPlaceholder: "Örn: PTT-TR94820194 veya KP barkod",
    samplePrefix: "PTT",
  },
  "HepsiJet": {
    name: "HepsiJet",
    code: "HJ",
    website: "https://www.hepsijet.com",
    customerService: "0850 558 03 33",
    trackingPlaceholder: "Örn: HJ-998822019 veya takip no",
    samplePrefix: "HJ",
  },
};

/**
 * Returns direct official carrier tracking portal URL for a given carrier and tracking number.
 */
export function getCarrierTrackingUrl(
  carrierName?: string | null,
  trackingNumber?: string | null
): string {
  if (!trackingNumber) {
    return "#";
  }

  const cleanNumber = encodeURIComponent(trackingNumber.trim());

  switch (carrierName) {
    case "Yurtiçi Kargo":
      return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${cleanNumber}`;
    case "Aras Kargo":
      return `https://www.araskargo.com.tr/kargotakip/?trackingNumber=${cleanNumber}`;
    case "MNG Kargo":
      return `https://www.mngkargo.com.tr/kargotakip?trackingNumber=${cleanNumber}`;
    case "Sürat Kargo":
      return `https://suratkargo.com.tr/KargoTakip/?kargotakipno=${cleanNumber}`;
    case "PTT Kargo":
      return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${cleanNumber}`;
    case "HepsiJet":
      return `https://www.hepsijet.com/gonderi-takibi/${cleanNumber}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${carrierName || "Kargo"} ${trackingNumber} takip`)}`;
  }
}

/**
 * Validates tracking number format according to carrier expectations.
 */
export function validateTrackingNumber(
  carrierName: string,
  trackingNumber: string
): { valid: boolean; message?: string } {
  if (!trackingNumber || typeof trackingNumber !== "string") {
    return { valid: false, message: "Takip numarası boş olamaz." };
  }

  const trimmed = trackingNumber.trim();
  if (trimmed.length < 5) {
    return { valid: false, message: "Takip numarası en az 5 karakter olmalıdır." };
  }

  if (trimmed.length > 50) {
    return { valid: false, message: "Takip numarası en fazla 50 karakter olabilir." };
  }

  // General alphanumeric + hyphen validation
  const validPattern = /^[A-Za-z0-9\-_]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, message: "Takip numarası yalnızca harf, rakam ve tire içerebilir." };
  }

  return { valid: true };
}

/**
 * Generates a mock or default tracking number with standard carrier prefix.
 */
export function generateTrackingNumber(carrierName: TurkishCarrier = "Yurtiçi Kargo"): string {
  const prefix = CARRIER_REGISTRY[carrierName]?.samplePrefix || "YRT";
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}-${randomDigits}`;
}
