const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Expo Router
config.resolver.alias = {
  ...config.resolver.alias,
  'expo-router': false,
};

module.exports = config;

