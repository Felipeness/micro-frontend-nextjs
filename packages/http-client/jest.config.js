module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'http-client',
  rootDir: '.',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};