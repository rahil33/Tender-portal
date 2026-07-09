/**
 * Notifications Module
 * Handles in-app notifications, email notifications, broadcast notifications,
 * scheduled notifications, and notification preferences for the tender portal.
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