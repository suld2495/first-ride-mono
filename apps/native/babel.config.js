module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './theme/tamagui.config.ts',
        },
      ],
      'react-native-reanimated/plugin', // must be last
    ],
  };
};
