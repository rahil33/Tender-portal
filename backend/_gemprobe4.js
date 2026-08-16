const axios = require('axios');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const urls = [
  'https://bidplus.gem.gov.in/showbidDocument/7469542',
  'https://bidplus.gem.gov.in/bidding/bid/showCatalogue/7469542',
  'https://bidplus.gem.gov.in/showbidDocumentPdf/7469542',
  'https://bidplus.gem.gov.in/all-bid-details/7469542',
  'https://bidplus.gem.gov.in/bidDetails/7469542',
];
async function check(url) {
  try {
    const r = await axios.get(url, { timeout: 20000, maxRedirects: 3, headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' }, validateStatus: (s) => s < 500 });
    const ct = r.headers['content-type'] || '';
    const isPdf = ct.includes('pdf');
    console.log(url, '=>', r.status, '| type:', ct.slice(0, 40), '| bytes:', (r.data && r.data.length) || (r.data && r.data.byteLength) || 0, isPdf ? '(PDF)' : '');
  } catch (e) {
    console.log(url, '=> ERR', e.message);
  }
}
async function main() {
  for (const u of urls) { await check(u); }
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });