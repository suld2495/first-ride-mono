const test = require('node:test');

const { RuleTester } = require('eslint');

const noApiCallOutsideAllowedLayers = require('../no-api-call-outside-allowed-layers');
const noRouterImportOutsideEntry = require('../no-router-import-outside-entry');
const noStoreImportInComponents = require('../no-store-import-in-components');
const uiLayerRules = require('../no-ui-layer-violation').rules;

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
    app: ['app/**'],
    api: ['api/**'],
    hooks: ['hooks/**'],
    store: ['store/**'],
  },
};

test('no-store-import-in-components detects native common layer', () => {
  ruleTester.run(
    'no-store-import-in-components/native-common',
    noStoreImportInComponents,
    {
      valid: [
        {
          code: "import { useColorScheme } from '@/hooks/useColorScheme';",
          filename:
            '/project/apps/native/components/ui/DarkMode.tsx',
          settings: nativeLayerSettings,
        },
      ],
      invalid: [
        {
          code: "import { useColorSchemeStore } from '@/store/colorScheme.store';",
          filename:
            '/project/apps/native/components/ui/DarkMode.tsx',
          settings: nativeLayerSettings,
          errors: [{ messageId: 'noStoreImport' }],
        },
      ],
    },
  );
});

test('no-api-call-outside-allowed-layers detects native common layer and native api layer', () => {
  ruleTester.run(
    'no-api-call-outside-allowed-layers/native-common',
    noApiCallOutsideAllowedLayers,
    {
      valid: [
        {
          code: "fetch('/api/theme');",
          filename: '/project/apps/native/api/theme.ts',
          settings: nativeLayerSettings,
        },
      ],
      invalid: [
        {
          code: "fetch('/api/theme');",
          filename:
            '/project/apps/native/components/ui/ThemeButton.tsx',
          settings: nativeLayerSettings,
          errors: [{ messageId: 'noApiCall' }],
        },
      ],
    },
  );
});

test('no-router-import-outside-entry detects native app and native common layer', () => {
  ruleTester.run(
    'no-router-import-outside-entry/native-common',
    noRouterImportOutsideEntry,
    {
      valid: [
        {
          code: "import { router } from 'expo-router';",
          filename: '/project/apps/native/app/index.tsx',
          settings: nativeLayerSettings,
        },
      ],
      invalid: [
        {
          code: "import { Link } from 'expo-router';",
          filename:
            '/project/apps/native/components/ui/LinkButton.tsx',
          settings: nativeLayerSettings,
          errors: [{ messageId: 'noRouterImportOutsideEntry' }],
        },
      ],
    },
  );
});

test('no-ui-layer-violation treats native common as ui layer', () => {
  ruleTester.run(
    'no-feature-import-in-ui/native-common',
    uiLayerRules['no-feature-import-in-ui'],
    {
      valid: [
        {
          code: "import { useColorScheme } from '@/hooks/useColorScheme';",
          filename:
            '/project/apps/native/components/ui/DarkMode.tsx',
          settings: nativeLayerSettings,
        },
      ],
      invalid: [
        {
          code: "import { useAuthStore } from '@/store/auth.store';",
          filename:
            '/project/apps/native/components/ui/ProfileButton.tsx',
          settings: nativeLayerSettings,
          errors: [{ messageId: 'noFeatureImportInUI' }],
        },
      ],
    },
  );
});
