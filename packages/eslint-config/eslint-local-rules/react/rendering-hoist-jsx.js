'use strict';

function isJSXNode(node) {
  return node?.type === 'JSXElement' || node?.type === 'JSXFragment';
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

function collectPatternIdentifiers(pattern, target) {
  if (!pattern) return;

  switch (pattern.type) {
    case 'Identifier':
      target.add(pattern.name);
      break;
    case 'AssignmentPattern':
      collectPatternIdentifiers(pattern.left, target);
      break;
    case 'RestElement':
      collectPatternIdentifiers(pattern.argument, target);
      break;
    case 'ArrayPattern':
      pattern.elements.forEach((element) => collectPatternIdentifiers(element, target));
      break;
    case 'ObjectPattern':
      pattern.properties.forEach((property) => {
        if (property.type === 'Property') {
          collectPatternIdentifiers(property.value, target);
        } else if (property.type === 'RestElement') {
          collectPatternIdentifiers(property.argument, target);
        }
      });
      break;
    default:
      break;
  }
}

function collectLocalNames(node) {
  const names = new Set();

  node.params.forEach((param) => collectPatternIdentifiers(param, names));

  if (node.body?.type !== 'BlockStatement') {
    return names;
  }

  for (const statement of node.body.body) {
    if (statement.type !== 'VariableDeclaration') continue;
    for (const declaration of statement.declarations) {
      collectPatternIdentifiers(declaration.id, names);
    }
  }

  return names;
}

function jsxReferencesOnlyLocals(root, allowedNames) {
  let hasIdentifier = false;
  let hasDisallowedIdentifier = false;
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'JSXAttribute') {
      stack.push(current.value);
      continue;
    }

    if (current.type === 'JSXIdentifier') {
      continue;
    }

    if (current.type === 'JSXExpressionContainer') {
      stack.push(current.expression);
      continue;
    }

    if (current.type === 'Identifier') {
      hasIdentifier = true;
      if (!allowedNames.has(current.name)) {
        hasDisallowedIdentifier = true;
      }
      continue;
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

  return !hasIdentifier || !hasDisallowedIdentifier;
}

function isComponent(node) {
  const name = getFunctionName(node);
  return Boolean(name && /^[A-Z]/.test(name) && functionReturnsJSX(node));
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '정적 JSX를 컴포넌트 내부에서 반복 생성하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      hoistStaticJsx:
        '정적 JSX는 컴포넌트 밖 상수로 분리하세요.\n 렌더마다 새 element가 생성되는 낭비를 막을 수 있습니다.',
    },
  },

  create(context) {
    const componentStack = [];

    function enterFunction(node) {
      componentStack.push(isComponent(node) ? collectLocalNames(node) : null);
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

      VariableDeclarator(node) {
        const currentNames = componentStack[componentStack.length - 1];
        if (!currentNames || !isJSXNode(node.init)) {
          return;
        }

        if (jsxReferencesOnlyLocals(node.init, currentNames)) {
          context.report({ node: node.init, messageId: 'hoistStaticJsx' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./rendering-hoist-jsx');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('rendering-hoist-jsx', rule, {
    valid: [
      `const ICON = <Icon name="star" size={24} />;
      const MyComponent = ({ iconName }) => {
        const dynamicIcon = <Icon name={iconName} />;
        return <View>{ICON}{dynamicIcon}</View>;
      };`,
    ],
    invalid: [
      {
        code: `const MyComponent = () => {
          const icon = <Icon name="star" size={24} />;
          return <View>{icon}</View>;
        };`,
        errors: [{ messageId: 'hoistStaticJsx' }],
      },
      {
        code: `const MyComponent = () => {
          const header = <View><Text>제목</Text></View>;
          return header;
        };`,
        errors: [{ messageId: 'hoistStaticJsx' }],
      },
    ],
  });
*/
