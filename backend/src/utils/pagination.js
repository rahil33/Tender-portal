const paginate = (items, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.ceil(total / limitNum);
  
  const paginatedItems = Array.isArray(items) 
    ? items.slice(startIndex, endIndex)
    : [];
  
  return {
    items: paginatedItems,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null,
    },
  };
};

const paginateQuery = (query, Model, page = 1, limit = 10, options = {}) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const { sortBy = 'createdAt', sortOrder = 'desc', select = '' } = options;
  
  const sort = {};
  sort[sortBy] = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  
  const queryPromise = query
    .sort(sort)
    .select(select)
    .skip(skip)
    .limit(limitNum);
  
  const countPromise = Model.countDocuments(query);
  
  return Promise.all([queryPromise, countPromise]).then(([items, total]) => {
    const totalPages = Math.ceil(total / limitNum);
    
    return {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        nextPage: pageNum < totalPages ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
      },
    };
  });
};

const buildPaginationLinks = (req, page, totalPages) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const query = req.query;
  
  const links = {
    self: new URL({
      ...query,
      page,
    }, baseUrl).toString(),
  };
  
  if (page > 1) {
    links.prev = new URL({
      ...query,
      page: page - 1,
    }, baseUrl).toString();
  }
  
  if (page < totalPages) {
    links.next = new URL({
      ...query,
      page: page + 1,
    }, baseUrl).toString();
  }
  
  if (totalPages > 1) {
    links.first = new URL({
      ...query,
      page: 1,
    }, baseUrl).toString();
    
    links.last = new URL({
      ...query,
      page: totalPages,
    }, baseUrl).toString();
  }
  
  return links;
};

module.exports = {
  paginate,
  paginateQuery,
  buildPaginationLinks,
};