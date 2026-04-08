'use strict';

const { createBaseConfig } = require('@repo/eslint-config');

module.exports = createBaseConfig({
  tsconfigPath: './tsconfig.json',
  useTanstackQuery: true,
  overrides: [
    {
      ignores: ['react-jsx-runtime.d.ts'],
    },
    {
      rules: {
        'consistent-return': 'off',
      },
    },
    {
      files: [
        'hooks/useFriend.ts',
        'hooks/useRequest.ts',
        'hooks/useRoutine.ts',
        'hooks/useStat.ts',
        'hooks/useUser.ts',
      ],
      rules: {
        'local-rules/query-key-must-use-factory': 'off',
      },
    },
    {
      files: [
        'api/index.ts',
        'hooks/useFriend.ts',
        'hooks/useQuest.ts',
        'hooks/useRequest.ts',
        'hooks/useRoutine.ts',
        'hooks/useStat.ts',
        'hooks/__tests__/useAuth.test.ts',
        'api/__tests__/auth.api.test.ts',
      ],
      rules: {
        'local-rules/require-async-error-handling': 'off',
      },
    },
    {
      files: ['api/index.ts'],
      rules: {
        'promise/prefer-await-to-callbacks': 'off',
        'no-param-reassign': 'off',
        'security/detect-object-injection': 'off',
      },
    },
    {
      files: ['hooks/useRoutine.ts'],
      rules: {
        'security/detect-object-injection': 'off',
      },
    },
  ],
});
