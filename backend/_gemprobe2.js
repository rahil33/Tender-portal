const axios = require('axios');
const baseUrl = 'https://bidplus.gem.gov.in';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getSession() {
  const r = await axios.get(`${baseUrl}/all-bids`, { timeout: 30000, headers: { 'User-Agent': userAgent } });
  const m = r.data.match(/id="chash"\s+value="([^"]+)"/);
  const cookies = (r.headers['set-cookie'] || []).map((c) => c.split(';')[0]).join('; ');
  return { csrf: m[1], cookies };
}

async function fetchPage(session, payload) {
  const body = new URLSearchParams({ payload: JSON.stringify(payload), csrf_bd_gem_nk: session.csrf }).toString();
  const r = await axios.post(`${baseUrl}/all-bids-data`, body, {
    timeout: 30000,
    headers: {
      'User-Agent': userAgent,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/all-bids`,
      'Cookie': session.cookies,
    },
  });
  return r.data.response.response;
}

function basePayload(page) {
  return {
    param: { searchBid: '', searchType: 'fullText' },
    filter: { bidStatusType: 'ongoing_bids', byType: 'all', highBidValue: '', byEndDate: { from: '', to: '' }, sort: 'Bid-End-Date-Latest' },
    page,
  };
}

async function main() {
  const session = await getSession();
  // Probe: does adding rows work?
  for (const extra of [{ rows: 50 }, { rows: 100 }, { rows: 1000 }, { pageSize: 50 }, { rows: 25 }]) {
    try {
      const payload = basePayload(1);
      Object.assign(payload, extra);
      const solr = await fetchPage(session, payload);
      console.log('extra', JSON.stringify(extra), '=> numFound:', solr.numFound, 'docs:', (solr.docs || []).length);
    } catch (e) {
      console.log('extra', JSON.stringify(extra), '=> ERR', e.message);
    }
  }
  // Probe deep pagination
  for (const page of [2, 50, 100, 500, 1000, 5086]) {
    try {
      const solr = await fetchPage(session, basePayload(page));
      console.log('page', page, '=> numFound:', solr.numFound, 'start:', solr.start, 'docs:', (solr.docs || []).length);
    } catch (e) {
      console.log('page', page, '=> ERR', e.message);
    }
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e.message); process.exit(1); });