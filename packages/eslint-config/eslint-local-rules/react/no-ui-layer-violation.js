'use strict';

const { isUiLayerFile } = require('../path-groups');

function isUIFile(context, filename) {
  if (!filename || filename === '<input>') return false;
  return isUiLayerFile(context, filename);
}

// ──────────────────────────────────────────────────────────────
// Rule 1: no-feature-import-in-ui
// ──────────────────────────────────────────────────────────────
const FORBIDDEN_IMPORT_PATTERNS = [
  /^@\/(features|store|services|api)(\/|$)/,
  /^(features|store|services|api)(\/|$)/,
];

const noFeatureImportInUI = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ui 레이어에서는 features, store, services import를 금지합니다.',
      recommended: false,
    },
    messages: {
      noFeatureImportInUI:
        'ui 레이어에서는 features, store, services 를 import할 수 없습니다.\n' +
        ' ui 컴포넌트는 hooks, utils, theme, constants 레이어만 참조하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isUIFile(context, filename)) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (FORBIDDEN_IMPORT_PATTERNS.some((pattern) => pattern.test(source))) {
          context.report({ node, messageId: 'noFeatureImportInUI' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 2: no-async-in-ui
// ──────────────────────────────────────────────────────────────
const noAsyncInUI = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ui 레이어에서는 비동기 호출을 금지합니다.',
      recommended: false,
    },
    messages: {
      noAsyncInUI:
        'ui 레이어에서는 비동기 호출을 할 수 없습니다.\n' +
        ' 비동기 로직은 hooks 레이어로 위임하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isUIFile(context, filename)) return {};

    function reportAsync(node) {
      context.report({ node, messageId: 'noAsyncInUI' });
    }

    function isAxiosCall(node) {
      // axios.get(), axios.post(), axios() 등
      if (node.callee.type === 'MemberExpression') {
        return (
          node.callee.object.type === 'Identifier' && node.callee.object.name === 'axios'
        );
      }
      return node.callee.type === 'Identifier' && node.callee.name === 'axios';
    }

    function isFetchCall(node) {
      return node.callee.type === 'Identifier' && node.callee.name === 'fetch';
    }

    return {
      // async 함수 선언/표현식
      'FunctionDeclaration[async=true]': reportAsync,
      'FunctionExpression[async=true]': reportAsync,
      'ArrowFunctionExpression[async=true]': reportAsync,

      // await 표현식
      AwaitExpression: reportAsync,

      // fetch() / axios 호출
      CallExpression(node) {
        if (isFetchCall(node) || isAxiosCall(node)) {
          reportAsync(node);
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 3: no-business-logic-in-ui
// ──────────────────────────────────────────────────────────────
const ARRAY_TRANSFORM_METHODS = new Set([
  'filter', 'map', 'reduce', 'reduceRight',
  'find', 'findIndex', 'findLast', 'findLastIndex',
  'forEach', 'some', 'every', 'flatMap', 'sort', 'flat',
]);

/** CallExpression 기준으로 배열 메서드 체인 깊이를 반환 */
function getArrayChainDepth(node) {
  if (node.type !== 'CallExpression') return 0;
  if (node.callee.type !== 'MemberExpression') return 0;

  const prop = node.callee.property;
  if (prop.type !== 'Identifier' || !ARRAY_TRANSFORM_METHODS.has(prop.name)) return 0;

  return 1 + getArrayChainDepth(node.callee.object);
}

/** 부모가 더 큰 체인의 일부인지 확인 (중복 리포트 방지) */
function isNestedChainNode(node) {
  const parent = node.parent;
  return (
    parent &&
    parent.type === 'MemberExpression' &&
    parent.object === node &&
    parent.parent &&
    parent.parent.type === 'CallExpression'
  );
}

const noBusinessLogicInUI = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'ui 레이어에서는 비즈니스 로직 작성을 금지합니다.',
      recommended: false,
    },
    messages: {
      noBusinessLogicInUI:
        'ui 레이어에서는 비즈니스 로직을 작성할 수 없습니다.\n' +
        ' 로직은 hooks 레이어로 위임하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isUIFile(context, filename)) return {};

    // 제어문 중첩 깊이 추적
    let controlFlowDepth = 0;

    function enterControl(node) {
      controlFlowDepth++;
      if (controlFlowDepth >= 3) {
        context.report({ node, messageId: 'noBusinessLogicInUI' });
      }
    }

    function exitControl() {
      controlFlowDepth--;
    }

    // 함수 경계에서 깊이 초기화 (중첩 함수 독립 처리)
    const depthStack = [];

    function enterFunction() {
      depthStack.push(controlFlowDepth);
      controlFlowDepth = 0;
    }

    function exitFunction() {
      controlFlowDepth = depthStack.pop() ?? 0;
    }

    return {
      // 함수 경계
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // 제어문 중첩 깊이
      IfStatement: enterControl,
      'IfStatement:exit': exitControl,
      ForStatement: enterControl,
      'ForStatement:exit': exitControl,
      ForInStatement: enterControl,
      'ForInStatement:exit': exitControl,
      ForOfStatement: enterControl,
      'ForOfStatement:exit': exitControl,
      WhileStatement: enterControl,
      'WhileStatement:exit': exitControl,
      DoWhileStatement: enterControl,
      'DoWhileStatement:exit': exitControl,
      SwitchStatement: enterControl,
      'SwitchStatement:exit': exitControl,

      // 배열 메서드 체이닝 2개 이상
      CallExpression(node) {
        const depth = getArrayChainDepth(node);
        if (depth >= 2 && !isNestedChainNode(node)) {
          context.report({ node, messageId: 'noBusinessLogicInUI' });
        }
      },

      // new Date() 직접 사용
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Date') {
          context.report({ node, messageId: 'noBusinessLogicInUI' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────
module.exports = {
  rules: {
    'no-feature-import-in-ui': noFeatureImportInUI,
    'no-async-in-ui': noAsyncInUI,
    'no-business-logic-in-ui': noBusinessLogicInUI,
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ─────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rules = require('./no-ui-layer-violation').rules;

  const parserOptions = {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  };

  // ── no-feature-import-in-ui ──────────────────────────────────
  const importTester = new RuleTester(parserOptions);
  importTester.run('no-feature-import-in-ui', rules['no-feature-import-in-ui'], {
    valid: [
      {
        code: `import { useTheme } from '@/hooks/useTheme';`,
        filename: '/project/src/components/ui/Button.tsx',
      },
      {
        // UI 파일이 아닌 경우 무시
        code: `import { useAuth } from '@/features/auth';`,
        filename: '/project/src/features/home/HomeScreen.tsx',
      },
    ],
    invalid: [
      {
        code: `import { useAuth } from '@/features/auth';`,
        filename: '/project/src/components/ui/Button.tsx',
        errors: [{ messageId: 'noFeatureImportInUI' }],
      },
      {
        code: `import { store } from '@/store';`,
        filename: '/project/src/components/ui/Input.tsx',
        errors: [{ messageId: 'noFeatureImportInUI' }],
      },
    ],
  });

  // ── no-async-in-ui ───────────────────────────────────────────
  const asyncTester = new RuleTester(parserOptions);
  asyncTester.run('no-async-in-ui', rules['no-async-in-ui'], {
    valid: [
      {
        code: `const Button = ({ onPress }) => <Pressable onPress={onPress} />;`,
        filename: '/project/src/components/ui/Button.tsx',
      },
    ],
    invalid: [
      {
        code: `const UI = async () => {};`,
        filename: '/project/src/components/ui/Button.tsx',
        errors: [{ messageId: 'noAsyncInUI' }],
      },
      {
        code: `const x = await fetchData();`,
        filename: '/project/src/components/ui/Input.tsx',
        errors: [{ messageId: 'noAsyncInUI' }],
      },
      {
        code: `fetch('/api/data');`,
        filename: '/project/src/components/ui/Card.tsx',
        errors: [{ messageId: 'noAsyncInUI' }],
      },
    ],
  });

  // ── no-business-logic-in-ui ──────────────────────────────────
  const logicTester = new RuleTester(parserOptions);
  logicTester.run('no-business-logic-in-ui', rules['no-business-logic-in-ui'], {
    valid: [
      {
        code: `const UI = () => { const x = items.filter(Boolean); return <View />; }`,
        filename: '/project/src/components/ui/Card.tsx',
      },
    ],
    invalid: [
      {
        // 체이닝 2개
        code: `const x = items.filter(Boolean).map(String);`,
        filename: '/project/src/components/ui/Card.tsx',
        errors: [{ messageId: 'noBusinessLogicInUI' }],
      },
      {
        // new Date()
        code: `const d = new Date();`,
        filename: '/project/src/components/ui/Card.tsx',
        errors: [{ messageId: 'noBusinessLogicInUI' }],
      },
      {
        // 3depth 중첩
        code: `const UI = () => {
          if (a) { if (b) { if (c) {} } }
          return <View />;
        }`,
        filename: '/project/src/components/ui/Card.tsx',
        errors: [{ messageId: 'noBusinessLogicInUI' }],
      },
    ],
  });
*/
