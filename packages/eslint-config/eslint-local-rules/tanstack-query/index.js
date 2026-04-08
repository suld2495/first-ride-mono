'use strict';

module.exports = {
  'query-key-no-nonserializable-values': require('./query-key-no-nonserializable-values'),
  'suspense-query-requires-error-boundary': require('./suspense-query-requires-error-boundary'),
  'infinite-query-requires-page-param': require('./infinite-query-requires-page-param'),
  'query-fn-must-use-abort-signal': require('./query-fn-must-use-abort-signal'),
  'mutation-must-handle-cache-sync': require('./mutation-must-handle-cache-sync'),
  'no-global-invalidate-queries': require('./no-global-invalidate-queries'),
  'query-key-must-be-array': require('./query-key-must-be-array'),
  'query-key-must-use-factory': require('./query-key-must-use-factory'),
  'no-dynamic-usequery-in-loops': require('./no-dynamic-usequery-in-loops'),
  'query-key-first-segment-static': require('./query-key-first-segment-static'),
  'require-enabled-on-conditional-query': require('./require-enabled-on-conditional-query'),
};
