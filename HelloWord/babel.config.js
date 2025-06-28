module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  
  // Cache the configuration based on the environment
  api.cache.using(() => process.env.NODE_ENV);

  const presets = ['module:@react-native/babel-preset'];
  const plugins = [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    // Add other plugins that should run in all environments
  ];

  // Web-specific configuration
  if (isWeb) {
    plugins.push(
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-web',
      // Add other web-specific plugins
    );
  }

  return {
    presets,
    plugins,
    env: {
      production: {
        plugins: [
          'transform-remove-console', // Remove console logs in production
        ],
      },
    },
  };
};
