module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: [
        'transform-remove-console', // Remove console logs in production
      ],
    },
  },
};
