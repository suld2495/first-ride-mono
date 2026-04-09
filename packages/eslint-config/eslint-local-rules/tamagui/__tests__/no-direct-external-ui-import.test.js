const test = require('node:test');

const { RuleTester } = require('eslint');

const rule = require('../no-direct-external-ui-import');

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

const nativeLayerSettings = {
  'local-rules/layers': {
    ui: ['components/ui/**'],
    theme: ['theme/**', 'styles/**'],
    components: ['components/**'],
    featureComponents: ['features/*/components/**'],
    app: ['app/**'],
    hooks: ['hooks/**', 'features/*/hooks/**'],
  },
};

test('tamagui no-direct-external-ui-import only checks component layers', () => {
  ruleTester.run('tamagui/no-direct-external-ui-import/component-scope', rule, {
    valid: [
      {
        code: "import { Button } from 'tamagui';",
        filename: 'components/ui/button.tsx',
        settings: nativeLayerSettings,
      },
      {
        code: "import { createAnimations } from '@tamagui/animations-react-native';",
        filename: 'theme/index.ts',
        settings: nativeLayerSettings,
      },
      {
        code: "import { useTheme } from 'tamagui';",
        filename: 'hooks/useThemeColors.ts',
        settings: nativeLayerSettings,
      },
    ],
    invalid: [
      {
        code: "import { Card } from 'tamagui';",
        filename: 'components/card.tsx',
        settings: nativeLayerSettings,
        errors: [{ messageId: 'noDirectUiImport', data: { packageName: 'tamagui' } }],
      },
      {
        code: "import { Checkbox } from '@tamagui/checkbox';",
        filename: 'features/auth/components/login-form.tsx',
        settings: nativeLayerSettings,
        errors: [
          {
            messageId: 'noDirectUiImport',
            data: { packageName: '@tamagui/checkbox' },
          },
        ],
      },
    ],
  });
});
