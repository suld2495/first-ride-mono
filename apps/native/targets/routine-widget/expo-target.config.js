/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'RoutineWidget',
  displayName: '이번 주 루틴',
  bundleIdentifier: '.RoutineWidget',
  deploymentTarget: '15.1',
  colors: {
    $accent: '#0984E3',
    $widgetBackground: '#FFFFFF',
  },
  entitlements: {
    'com.apple.security.application-groups': config.ios?.entitlements?.[
      'com.apple.security.application-groups'
    ] ?? ['group.com.mannal.firstride'],
  },
});
