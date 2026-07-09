/**
 * Users Module
 * Comprehensive user management system
 */

module.exports = {
  controller: require('./users.controller'),
  service: require('./users.service'),
  routes: require('./users.routes'),
  models: require('./users.model'),
  validators: require('./users.validators'),
  dtos: require('./users.dto'),
};
