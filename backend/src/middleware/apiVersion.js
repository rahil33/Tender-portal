const API_VERSION = 'v1';

const apiVersion = (req, res, next) => {
  // Set API version in response header
  res.setHeader('X-API-Version', API_VERSION);
  
  // Make version available in request
  req.apiVersion = API_VERSION;
  
  next();
};

const getVersionedPath = (path) => {
  return `/api/${API_VERSION}${path}`;
};

const deprecateRoute = (message, sunsetDate) => {
  return (req, res, next) => {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', sunsetDate);
    res.setHeader('Link', `<${sunsetDate}>; rel="deprecation"`);
    
    if (!req.headers['x-suppress-deprecation-warning']) {
      res.setHeader('X-Deprecation-Warning', message);
    }
    
    next();
  };
};

module.exports = {
  API_VERSION,
  apiVersion,
  getVersionedPath,
  deprecateRoute,
};