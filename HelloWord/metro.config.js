const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Get the default Metro config for React Native
const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration for React Native
 * https://reactnative.dev/docs/metro
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Add support for additional file extensions
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs', 'cjs'],
    assetExts: [...defaultConfig.resolver.assetExts, 'svg'],
  },
  // Add watch folders for shared code outside HelloWord directory
  watchFolders: [
    path.resolve(__dirname, '../src'),
  ],
};

module.exports = mergeConfig(defaultConfig, config);
