module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 1) env 인라인이 먼저 (EXPO_ROUTER_APP_ROOT 치환)
      [
        'transform-inline-environment-variables',
        {
          include: ['EXPO_ROUTER_APP_ROOT'],
        },
      ],

      // 3) 항상 마지막
      'react-native-reanimated/plugin',
    ],
  };
};
