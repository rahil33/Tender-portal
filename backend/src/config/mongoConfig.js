const mongoose = require('mongoose');

const mongoConfig = {
  connection: {
    maxPoolSize: 50,
    minPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10000,
  },
  backup: {
    enabled: true,
    continuousBackup: true,
    pointInTimeRecovery: true,
    snapshotSchedule: 'daily',
    retentionDays: 30,
    crossRegionBackup: true,
  },
  archive: {
    enabled: true,
    autoArchiveDays: 90,
    collections: ['tenders', 'bids', 'notifications', 'documents'],
  },
  monitoring: {
    profiler: true,
    slowQueryThreshold: 100,
    performanceAdvisor: true,
  },
  security: {
    tls: true,
    encryptionAtRest: true,
    auditLogging: true,
    ipWhitelist: [],
  },
};

module.exports = mongoConfig;