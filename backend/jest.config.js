module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/uploads/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testMatch: ['**/*.test.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 10000,
};