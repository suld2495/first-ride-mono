module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "plugin:import/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/warnings",
    "naver",
    "prettier",
    "plugin:prettier/recommended"
  ],
  "globals": {
    "React": "writable"
  },
  "plugins": ["@typescript-eslint", "import", "simple-import-sort"],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "parser": "@typescript-eslint/parser",
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "varsIgnorePattern": "^_" }],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "react/jsx-uses-vars": "off",
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "no-alert": "off",
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      }
    ],
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "no-use-before-define": "off",
    "import/prefer-default-export": "off",
    "react/no-unescaped-entities": "off",
    "class-methods-use-this": "off"
  },
  "overrides": [
    {
      "files": ["*.js", "*.jsx", "*.ts", "*.tsx"],
      "rules": {
        "simple-import-sort/imports": [
          "error",
          {
            "groups": [
              // Packages `react` related packages come first.
              ["^react", "^@?\\w"],
              // Internal packages.
              ["^(@|components)(/.*|$)"],
              // Side effect imports.
              ["^\\u0000"],
              // Parent imports. Put `..` last.
              ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
              // Other relative imports. Put same-folder imports and `.` last.
              ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
              // Style imports.
              ["^.+\\.?(css)$"]
            ]
          }
        ]
      }
    }
  ]
}
