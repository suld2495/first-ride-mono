'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);

  return (
    /\/components\/.*\.tsx$/.test(normalized) ||
    /\/features\/[^/]+\/components\/.*\.tsx$/.test(normalized)
  );
}

function isJSXNode(node) {
  return node?.type === 'JSXElement' || node?.type === 'JSXFragment';
}

function pushChildNodes(stack, node) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || !value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && typeof item.type === 'string') {
          stack.push(item);
        }
      }
      continue;
    }

    if (typeof value === 'object' && typeof value.type === 'string') {
      stack.push(value);
    }
  }
}

function functionReturnsJSX(node) {
  if (!node) return false;

  if (
    node.type === 'ArrowFunctionExpression' &&
    node.body &&
    node.body.type !== 'BlockStatement'
  ) {
    return isJSXNode(node.body);
  }

  const body = node.body;
  if (!body || body.type !== 'BlockStatement') return false;

  const stack = [...body.body];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'ReturnStatement' && isJSXNode(current.argument)) {
      return true;
    }

    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      continue;
    }

    pushChildNodes(stack, current);
  }

  return false;
}

function getTypeAnnotationNode(parameter) {
  return parameter?.typeAnnotation?.typeAnnotation ?? null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '컴포넌트 props 타입은 인라인이 아닌 별도 Props 타입/인터페이스를 사용하도록 강제합니다.',
      recommended: false,
    },
    messages: {
      extractPropsType:
        'props 타입은 인라인으로 정의하지 말고 별도 Props 타입/인터페이스로 분리하세요.\n (예: type Props = { ... })',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    function checkFunction(node) {
      if (!functionReturnsJSX(node)) return;

      const firstParameter = node.params[0];
      const typeAnnotation = getTypeAnnotationNode(firstParameter);

      if (typeAnnotation?.type !== 'TSTypeLiteral') return;

      context.report({
        node: firstParameter,
        messageId: 'extractPropsType',
      });
    }

    return {
      FunctionDeclaration: checkFunction,
      ArrowFunctionExpression: checkFunction,
      FunctionExpression: checkFunction,
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./require-props-interface');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('require-props-interface', rule, {
//   valid: [{
//     filename: '/project/src/components/user-card.tsx',
//     code: `type Props = { name: string }; const UserCard = ({ name }: Props) => <View />;`,
//   }],
//   invalid: [{
//     filename: '/project/src/components/user-card.tsx',
//     code: `const UserCard = ({ name }: { name: string }) => <View />;`,
//     errors: [{ messageId: 'extractPropsType' }],
//   }],
// });
