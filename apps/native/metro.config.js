// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withTamagui } = require('@tamagui/metro-plugin');

const projectRoot = __dirname;
const zustandMiddlewareCommonJsPath = require.resolve('zustand/middleware', {
  paths: [projectRoot],
});

const config = getDefaultConfig(projectRoot);
const tamaguiConfig = withTamagui(config, {
  components: ['tamagui'],
  config: './theme/tamagui.config.ts',
});
const defaultResolveRequest = tamaguiConfig.resolver.resolveRequest;

tamaguiConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'zustand/middleware') {
    return {
      filePath: zustandMiddlewareCommonJsPath,
      type: 'sourceFile',
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = tamaguiConfig;
