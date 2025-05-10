// module.exports = {
//   collectCoverage: true,
//   coverageDirectory: "coverage",
//   coverageReporters: ["text", "lcov"],
// };

// Option 1: In jest.config.js
module.exports = {
  // Your other Jest configuration...
  setupFiles: ['./jest-setup.js']
};

// Option 2: In package.json
/*
{
  "jest": {
    "setupFiles": ["./jest-setup.js"]
  }
}
*/