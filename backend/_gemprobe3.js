const axios = require('axios');
const baseUrl = 'https://bidplus.gem.gov.in';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getSession() {
  const r = await axios.get(`${baseUrl}/all-bids`, { timeout: 30000, headers: { 'User-Agent': userAgent } });
  const m = r.data.match(/id="chash"\s+value="([^"]+)"/);
  const cookies = (r.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('; ');
  return { csrf: m[1], cookies };
}
async function fetchPage(session, page) {
  const payload = { param: { searchBid: '', searchType: 'fullText' }, filter: { bidStatusType: 'ongoing_bids', byType: 'all', highBidValue: '', byEndDate: { from: '', to: '' }, sort: 'Bid-End-Date-Latest' }, page };
  const body = new URLSearchParams({ payload: JSON.stringify(payload), csrf_bd_gem_nk: session.csrf }).toString();
  const r = await axios.post(`${baseUrl}/all-bids-data`, body, { timeout: 30000, headers: { 'User-Agent': userAgent, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', 'Origin': baseUrl, 'Referer': `${baseUrl}/all-bids`, 'Cookie': session.cookies } });
  return r.data.response.response;
}
async function main() {
  const session = await getSession();
  const seen = {};
  for (let p = 1; p <= 3; p++) {
    const solr = await fetchPage(session, p);
    for (const d of solr.docs) {
      const rec = { id: d.b_id && d.b_id[0], num: d.b_bid_number && d.b_bid_number[0], type: d.b_bid_type && d.b_bid_type[0], btype: d.b_type && d.b_type[0], bstatus: d.b_buyer_status && d.b_buyer_status[0], status: d.b_status && d.b_status[0], inactive: d.b_is_inactive && d.b_is_inactive[0], cat: d.b_category_name && d.b_category_name[0], bdcat: d.bd_category_name && d.bd_category_name[0], bbidtora: d.b_bid_to_ra && d.b_bid_to_ra[0], ratorabid: d.b_ra_to_bid && d.b_ra_to_bid[0], eval: d.b_eval_type && d.b_eval_type[0], minName: d.ba_official_details_minName && d.ba_official_details_minName[0], dept: d.ba_official_details_deptName && d.ba_official_details_deptName[0], quantity: d.b_total_quantity && d.b_total_quantity[0] };
      const key = 'type' + rec.type + '|btype' + rec.btype + '|bstatus' + rec.bstatus + '|inactive' + rec.inactive + '|rc' + (d.is_rc_bid && d.is_rc_bid[0]);
      if (!seen[key]) { seen[key] = rec; }
      if (Object.keys(seen).length >= 8) break;
    }
    if (Object.keys(seen).length >= 8) break;
  }
  for (const k of Object.keys(seen)) { console.log(k, '=>', JSON.stringify(seen[k])); }
  console.log('unique combos seen:', Object.keys(seen).length);
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });