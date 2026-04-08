'use strict';

module.exports = {
  'max-file-lines': require('./max-file-lines'),
  'require-async-error-handling': require('./require-async-error-handling'),
  'no-relative-import-outside-feature': require('./no-relative-import-outside-feature'),
  'enforce-filename-convention': require('./enforce-filename-convention'),
  'require-barrel-export': require('./require-barrel-export'),
  'no-trivial-usememo': require('./no-trivial-usememo'),
  'require-functional-setstate': require('./require-functional-setstate'),
  'no-function-call-in-usestate': require('./no-function-call-in-usestate'),
  'no-setstate-in-effect-for-derived': require('./no-setstate-in-effect-for-derived'),
  'prefer-flatmap': require('./prefer-flatmap'),
  'no-find-in-loop': require('./no-find-in-loop'),
  'no-sort-for-minmax': require('./no-sort-for-minmax'),
  'no-includes-in-loop': require('./no-includes-in-loop'),
  'js-hoist-regexp': require('./js-hoist-regexp'),
  'js-index-maps': require('./js-index-maps'),
};
