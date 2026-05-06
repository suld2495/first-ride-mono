// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withTamagui } = require('@tamagui/metro-plugin');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './theme/tamagui.config.ts',
});
