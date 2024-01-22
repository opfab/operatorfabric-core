module.exports = {
    preset: 'ts-jest',
    collectCoverageFrom: ['src/**/*.{js,jsx,ts}'],
    watchPathIgnorePatterns: ['tmp/'], 
    testEnvironment: 'node',
  };
  