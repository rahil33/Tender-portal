/**
 * Dashboard Module
 * Handles user dashboard operations, statistics, activities, and preferences
 */

const dashboardRoutes = require('./dashboard.routes');
const { Activity, Stats, Preferences } = require('./dashboard.model');
const dashboardService = require('./dashboard.service');
const dashboardController = require('./dashboard.controller');
const dashboardValidators = require('./dashboard.validators');
const {
  DashboardOverviewDTO,
  DashboardStatsDTO,
  ActivityDTO,
  PreferencesDTO,
  ActivityLogRequestDTO,
  PaginatedResponseDTO,
  APIResponseDTO,
} = require('./dashboard.dto');

module.exports = {
  // Routes
  dashboardRoutes,
  
  // Models
  dashboardModels: {
    Activity,
    Stats,
    Preferences,
  },
  
  // Service
  dashboardService,
  
  // Controller
  dashboardController,
  
  // Validators
  dashboardValidators,
  
  // DTOs
  dashboardDTOs: {
    DashboardOverviewDTO,
    DashboardStatsDTO,
    ActivityDTO,
    PreferencesDTO,
    ActivityLogRequestDTO,
    PaginatedResponseDTO,
    APIResponseDTO,
  },
};
