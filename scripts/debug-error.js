async function main() {
  const r = await fetch('http://localhost:3099/p/about');
  const text = await r.text();
  const match = text.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (match) {
    const json = JSON.parse(match[1]);
    console.log('STATUS:', r.status);
    console.log('ERROR:', JSON.stringify(json.props?.pageProps?.err || json.err, null, 2));
  } else {
    console.log('STATUS:', r.status);
    console.log('TEXT:', text.slice(0, 800));
  }
}
main().catch(console.error);
