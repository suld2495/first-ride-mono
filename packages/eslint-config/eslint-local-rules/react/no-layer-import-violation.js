'use strict';

module.exports = {
  rules: {
    'no-feature-import-in-ui':
      require('./no-ui-layer-violation').rules['no-feature-import-in-ui'],
  },
};
