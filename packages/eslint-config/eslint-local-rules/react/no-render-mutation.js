'use strict';

const MUTATING_METHODS = new Set(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']);

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function isJSXNode(node) {
  return node?.type === 'JSXElement' || node?.type === 'JSXFragment';
}

function functionReturnsJSX(node) {
  if (!node) return false;

  if (node.type === 'ArrowFunctionExpression' && node.body && node.body.type !== 'BlockStatement') {
    return isJSXNode(node.body);
  }

  if (node.body?.type !== 'BlockStatement') return false;

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

    for (const [key, value] of Object.entries(current)) {
      if (key === 'parent') continue;
      if (!value) continue;

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

  return false;
}

function collectPatternIdentifiers(pattern, target) {
  if (!pattern) return;

  if (pattern.type === 'Identifier') {
    target.add(pattern.name);
    return;
  }

  if (pattern.type === 'RestElement') {
    collectPatternIdentifiers(pattern.argument, target);
    return;
  }

  if (pattern.type === 'AssignmentPattern') {
    collectPatternIdentifiers(pattern.left, target);
    return;
  }

  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements) {
      if (element) collectPatternIdentifiers(element, target);
    }
    return;
  }

  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties) {
      if (property.type === 'Property') {
        collectPatternIdentifiers(property.value, target);
      } else if (property.type === 'RestElement') {
        collectPatternIdentifiers(property.argument, target);
      }
    }
  }
}

function collectLocalNames(componentNode) {
  const names = new Set();

  for (const parameter of componentNode.params) {
    collectPatternIdentifiers(parameter, names);
  }

  if (componentNode.body?.type !== 'BlockStatement') {
    return names;
  }

  const stack = [...componentNode.body.body];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'FunctionDeclaration' && current.id) {
      names.add(current.id.name);
    }

    if (current.type === 'ClassDeclaration' && current.id) {
      names.add(current.id.name);
    }

    if (current.type === 'VariableDeclaration') {
      for (const declaration of current.declarations) {
        collectPatternIdentifiers(declaration.id, names);
      }
    }

    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (key === 'parent') continue;
      if (!value) continue;

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

  return names;
}

function getPropNames(componentNode) {
  const names = new Set();

  for (const parameter of componentNode.params) {
    collectPatternIdentifiers(parameter, names);
  }

  return names;
}

function getRootIdentifier(node) {
  let current = node;

  while (current?.type === 'MemberExpression') {
    current = current.object;
  }

  return current?.type === 'Identifier' ? current : null;
}

function isPropMutationTarget(node, propNames) {
  const rootIdentifier = getRootIdentifier(node);
  return Boolean(rootIdentifier && propNames.has(rootIdentifier.name));
}

function isExternalIdentifierMutation(node, localNames) {
  return node.type === 'Identifier' && !localNames.has(node.name);
}

function traverseRenderBody(rootNode, visitor) {
  const stack = [rootNode];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visitor(current);

    if (
      current !== rootNode &&
      (current.type === 'FunctionDeclaration' ||
        current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression')
    ) {
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (key === 'parent') continue;
      if (!value) continue;

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
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'React 렌더 중 props나 외부 상태를 직접 변경하는 코드를 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noRenderMutation:
        '렌더 중에 props나 외부 상태를 직접 변경하지 마세요. 복사본을 만들어서 사용하세요. (예: [...items].sort())',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    function inspectComponent(node) {
      if (!functionReturnsJSX(node)) return;
      if (node.body?.type !== 'BlockStatement') return;

      const propNames = getPropNames(node);
      const localNames = collectLocalNames(node);

      traverseRenderBody(node.body, (current) => {
        if (
          current.type === 'AssignmentExpression' &&
          current.left.type === 'MemberExpression' &&
          isPropMutationTarget(current.left, propNames)
        ) {
          context.report({
            node: current,
            messageId: 'noRenderMutation',
          });
          return;
        }

        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'MemberExpression' &&
          !current.callee.computed &&
          MUTATING_METHODS.has(current.callee.property.name) &&
          isPropMutationTarget(current.callee.object, propNames)
        ) {
          context.report({
            node: current,
            messageId: 'noRenderMutation',
          });
          return;
        }

        if (current.type !== 'UpdateExpression') return;

        if (
          current.argument.type === 'MemberExpression' &&
          isPropMutationTarget(current.argument, propNames)
        ) {
          context.report({
            node: current,
            messageId: 'noRenderMutation',
          });
          return;
        }

        if (isExternalIdentifierMutation(current.argument, localNames)) {
          context.report({
            node: current,
            messageId: 'noRenderMutation',
          });
        }
      });
    }

    return {
      FunctionDeclaration: inspectComponent,
      FunctionExpression: inspectComponent,
      ArrowFunctionExpression: inspectComponent,
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-render-mutation');
//
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: tsParser,
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
//
// tester.run('no-render-mutation', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'const MyComponent = ({ items }) => { const sorted = [...items].sort(); return <View data={sorted} />; };',
//     },
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'let count = 0; const MyComponent = () => { const onPress = () => { count++; }; return <Button onPress={onPress} />; };',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'const MyComponent = ({ user }) => { user.name = "modified"; return <View />; };',
//       errors: [{ messageId: 'noRenderMutation' }],
//     },
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'let count = 0; const MyComponent = () => { count++; return <View />; };',
//       errors: [{ messageId: 'noRenderMutation' }],
//     },
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'const MyComponent = ({ items }) => { items.push(newItem); return <View />; };',
//       errors: [{ messageId: 'noRenderMutation' }],
//     },
//   ],
// });
