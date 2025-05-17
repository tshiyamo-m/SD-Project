module.exports = {
  // Test environment and basic config
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  
  // Transformation settings
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)'
  ],
  
  // Module handling
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1' // If you use path aliases
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};