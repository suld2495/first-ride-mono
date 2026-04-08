'use strict';

function isJSXNode(node) {
  return node?.type === 'JSXElement' || node?.type === 'JSXFragment';
}

function isComponentName(name) {
  return typeof name === 'string' && /^[A-Z]/.test(name);
}

function pushChildNodes(stack, node) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || !value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string') {
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

  if (node.type === 'ArrowFunctionExpression' && node.body?.type !== 'BlockStatement') {
    return isJSXNode(node.body);
  }

  if (node.body?.type !== 'BlockStatement') {
    return false;
  }

  const stack = [...node.body.body];

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

function getFunctionName(node) {
  if (!node) return null;

  if (node.type === 'FunctionDeclaration' && node.id) {
    return node.id.name;
  }

  if (
    (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') &&
    node.parent?.type === 'VariableDeclarator' &&
    node.parent.id.type === 'Identifier'
  ) {
    return node.parent.id.name;
  }

  return null;
}

function isReactComponent(node) {
  const name = getFunctionName(node);
  return isComponentName(name) && functionReturnsJSX(node);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '컴포넌트 함수 내부에서 다른 컴포넌트를 선언하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noInlineComponent:
        '컴포넌트 안에서 다른 컴포넌트를 선언하지 마세요.\n 렌더마다 재정의되어 리마운트가 발생합니다.\n 컴포넌트 밖으로 분리하세요.',
    },
  },

  create(context) {
    const componentStack = [];

    function enterFunction(node) {
      componentStack.push(isReactComponent(node));

      if (componentStack.length < 2) {
        return;
      }

      const name = getFunctionName(node);
      if (isComponentName(name) && functionReturnsJSX(node)) {
        context.report({ node, messageId: 'noInlineComponent' });
      }
    }

    function exitFunction() {
      componentStack.pop();
    }

    return {
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-inline-component');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('no-inline-component', rule, {
    valid: [
      `const Child = () => <View />;
      const Parent = () => <Child />;`,
    ],
    invalid: [
      {
        code: `const Parent = () => {
          const Child = () => <View />;
          return <Child />;
        };`,
        errors: [{ messageId: 'noInlineComponent' }],
      },
      {
        code: `function Parent() {
          function Item() {
            return <Text>Hi</Text>;
          }
          return <Item />;
        }`,
        errors: [{ messageId: 'noInlineComponent' }],
      },
    ],
  });
*/
