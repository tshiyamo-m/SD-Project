// module.exports = {
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coverageReporters: ["text", "lcov"],
// };
// module.exports = {
//   transform: {
//     "^.+\\.[t|j]sx?$": "babel-jest"
//   },
//   transformIgnorePatterns: [
//     "node_modules/(?!(axios)/)"
//   ]
// };

// // Ensure you have the correct babel configuration in .babelrc or babel.config.js:
// // babel.config.js example:
// module.exports = {
//   presets: [
//     ['@babel/preset-env', {targets: {node: 'current'}}],
//     '@babel/preset-react'
//   ]
// };




// module.exports = {
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coverageReporters: ["text", "lcov"],
//   transform: {
//     "^.+\\.[tj]sx?$": "babel-jest" // Simplified pattern
//   },
//   transformIgnorePatterns: [
//     "node_modules/(?!(axios)/)"
//   ],
//   moduleNameMapper: {
//     "\\.css$": "identity-obj-proxy"
//   },
//   testEnvironment: "jsdom"
// };

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
  // This ensures Jest looks in both Pages and Models folders
  roots: [
    
    "<rootDir>/src/Backend/models",
    "<rootDir>/src/Backend/Controllers"
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
