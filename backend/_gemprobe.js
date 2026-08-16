process.env.NODE_ENV = 'test';
const axios = require('axios');
const baseUrl = 'https://bidplus.gem.gov.in';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
  const sessionRes = await axios.get(`${baseUrl}/all-bids`, {
    timeout: 30000,
    headers: { 'User-Agent': userAgent, 'Accept': 'text/html,*/*' },
  });
  const html = sessionRes.data;
  const tokenMatch = html.match(/id="chash"\s+value="([^"]+)"/);
  console.log('has chash token:', !!tokenMatch);
  const cookies = (sessionRes.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('; ');

  const payload = {
    param: { searchBid: '', searchType: 'fullText' },
    filter: { bidStatusType: 'ongoing_bids', byType: 'all', highBidValue: '', byEndDate: { from: '', to: '' }, sort: 'Bid-End-Date-Latest' },
    page: 1,
  };
  const body = new URLSearchParams({ payload: JSON.stringify(payload), csrf_bd_gem_nk: tokenMatch[1] }).toString();
  const dataRes = await axios.post(`${baseUrl}/all-bids-data`, body, {
    timeout: 30000,
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/all-bids`,
      'Cookie': cookies,
    },
  });
  const data = dataRes.data;
  const solr = data.response && data.response.response;
  console.log('code:', data.code, '| numFound:', solr.numFound, '| start:', solr.start, '| docs on page:', (solr.docs || []).length);
  if (solr.docs && solr.docs.length) {
    const doc = solr.docs[0];
    console.log('FIELDS:');
    console.log(Object.keys(doc).sort().join('\n'));
    console.log('\n--- SAMPLE VALUES ---');
    const interesting = ['b_id', 'b_bid_number', 'b_bid_type', 'b_category_name', 'bbt_title', 'ba_official_details_minName', 'ba_official_details_deptName', 'b_total_quantity', 'final_start_date_sort', 'final_end_date_sort', 'b_delivery_state', 'ba_state_name', 'b_delivery_city', 'ba_city_name', 'b_bid_value', 'b_reserve_price', 'b_estimated_value', 'b_catalogue_url', 'ba_org_name', 'ba_department', 'b_location', 'b_delivery_address', 'ba_payment_seller_type', 'ba_type', 'b_tc_support', 'is_rc_bid', 'b_end_date', 'b_start_date'];
    for (const k of interesting) {
      if (k in doc) console.log(k, '=', JSON.stringify(doc[k]).slice(0, 300));
    }
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error('SCRAPE ERR', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data).slice(0, 500) : e.message); process.exit(1); });