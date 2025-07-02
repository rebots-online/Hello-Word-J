module.exports = {
  preset: 'react-native',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageThreshold: {
    global: { lines: 1 },
  },
};
