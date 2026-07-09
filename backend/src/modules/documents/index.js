/**
 * Documents Module
 * Document management for the Phoenix Tender Portal
 */

module.exports = {
  controller: require('./controller'),
  service: require('./service'),
  routes: require('./routes'),
  models: require('./model'),
  validators: require('./validator'),
  dtos: require('./dto'),
  constants: require('./constants'),
};