'use strict';

module.exports = {
  'no-raw-color-in-style': require('./no-raw-color-in-style'),
  'no-raw-size-in-style': require('./no-raw-size-in-style'),
  'no-inline-style-except-design': require('./no-inline-style-except-design'),
  'no-raw-style-value-outside-ui': require('./no-raw-style-value-outside-ui').rules[
    'no-raw-style-value-outside-ui'
  ],
  'no-tamagui-token-string-outside-ui': require('./no-raw-style-value-outside-ui').rules[
    'no-tamagui-token-string-outside-ui'
  ],
  'no-multiple-components-in-file': require('./no-multiple-components-in-file'),
  'enforce-component-member-order': require('./enforce-component-member-order'),
  'no-cross-feature-import': require('./no-cross-feature-import'),
  'no-store-import-in-components': require('./no-store-import-in-components'),
  'no-api-call-outside-allowed-layers': require('./no-api-call-outside-allowed-layers'),
  'no-direct-external-ui-import': require('./no-direct-external-ui-import'),
  'no-zustand-without-selector': require('./no-zustand-without-selector'),
  'no-zustand-full-selector': require('./no-zustand-full-selector'),
  'no-render-mutation': require('./no-render-mutation'),
  'no-inline-component': require('./no-inline-component'),
  'no-inline-default-in-memo': require('./no-inline-default-in-memo'),
  'strict-boolean-jsx-expression': require('./strict-boolean-jsx-expression'),
  'rendering-hoist-jsx': require('./rendering-hoist-jsx'),
  'no-global-init-in-effect': require('./no-global-init-in-effect'),
  'async-parallel': require('./async-parallel'),
  'async-defer-await': require('./async-defer-await'),
  'require-passive-event-listener': require('./require-passive-event-listener'),
  'no-router-import-outside-entry': require('./no-router-import-outside-entry'),
  'no-array-index-key-in-jsx': require('./no-array-index-key-in-jsx'),
  'no-unstable-value-in-render': require('./no-unstable-value-in-render'),
  ...require('./no-layer-import-violation').rules,
  ...require('./no-api-call-violation').rules,
  ...require('./no-ui-layer-violation').rules,
  ...require('./no-business-logic-in-component').rules,
  ...require('./no-component-layer-violation').rules,
  ...require('./api-error-handling').rules,
  'require-tanstack-query-for-api': require('./require-tanstack-query-for-api'),
};
