const parsedPageSize = parseInt(process.env.GEM_PAGE_SIZE, 10);
const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 10;
console.log('pageSize:', pageSize);