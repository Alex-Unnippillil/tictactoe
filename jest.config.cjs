module.exports = {
  testMatch: ['<rootDir>/tests/unit/**/*.spec.js'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setupExpect.js'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
};
