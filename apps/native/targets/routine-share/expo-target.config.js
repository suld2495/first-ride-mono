/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'share',
  name: 'RoutineShareExtension',
  displayName: '이루라',
  bundleIdentifier: '.RoutineShareExtension',
  deploymentTarget: '15.1',
  entitlements: {
    'com.apple.security.application-groups': config.ios?.entitlements?.[
      'com.apple.security.application-groups'
    ] ?? ['group.com.mannal.firstride'],
  },
});
