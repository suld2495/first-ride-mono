'use strict';

module.exports = {
  rules: {
    'no-business-logic-in-ui':
      require('./no-ui-layer-violation').rules['no-business-logic-in-ui'],
  },
};
