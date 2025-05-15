module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)"
  ]
};

// Ensure you have the correct babel configuration in .babelrc or babel.config.js:
// babel.config.js example:
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-react'
  ]
};