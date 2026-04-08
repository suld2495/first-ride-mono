'use strict';

const LIST_COMPONENTS = new Set(['FlatList', 'SectionList']);

function getJSXTagName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return nameNode.property.name;
  return null;
}

function isMemoCall(node) {
  if (!node || node.type !== 'CallExpression') return false;

  if (node.callee.type === 'Identifier' && node.callee.name === 'memo') {
    return true;
  }

  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'React' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'memo'
  );
}

function getMemoizedComponentNames(programNode) {
  const memoizedNames = new Set();

  for (const statement of programNode.body) {
    if (statement.type !== 'VariableDeclaration') continue;

    for (const declaration of statement.declarations) {
      if (
        declaration.id.type === 'Identifier' &&
        declaration.init &&
        isMemoCall(declaration.init)
      ) {
        memoizedNames.add(declaration.id.name);
      }
    }
  }

  return memoizedNames;
}

function getRenderItemExpression(attribute) {
  if (
    !attribute ||
    attribute.type !== 'JSXAttribute' ||
    attribute.name.type !== 'JSXIdentifier' ||
    attribute.name.name !== 'renderItem' ||
    !attribute.value ||
    attribute.value.type !== 'JSXExpressionContainer'
  ) {
    return null;
  }

  return attribute.value.expression;
}

function getReturnedJSXNode(functionNode) {
  if (!functionNode) return null;

  if (
    functionNode.type === 'ArrowFunctionExpression' &&
    functionNode.body &&
    functionNode.body.type !== 'BlockStatement'
  ) {
    return functionNode.body;
  }

  const body = functionNode.body;
  if (!body || body.type !== 'BlockStatement') return null;

  for (const statement of body.body) {
    if (statement.type === 'ReturnStatement' && statement.argument) {
      return statement.argument;
    }
  }

  return null;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'FlatList와 SectionList의 renderItem 컴포넌트는 React.memo 적용을 강제합니다.',
      recommended: false,
    },
    messages: {
      requireMemo:
        'FlatList/SectionList 의 renderItem 컴포넌트는 React.memo 로 감싸세요.',
    },
    schema: [],
  },

  create(context) {
    let memoizedComponentNames = new Set();

    return {
      Program(node) {
        memoizedComponentNames = getMemoizedComponentNames(node);
      },

      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (!componentName || !LIST_COMPONENTS.has(componentName)) return;

        const renderItemAttribute = node.attributes.find(
          (attribute) => getRenderItemExpression(attribute) !== null,
        );
        const renderItemExpression = getRenderItemExpression(renderItemAttribute);

        if (
          !renderItemExpression ||
          (renderItemExpression.type !== 'ArrowFunctionExpression' &&
            renderItemExpression.type !== 'FunctionExpression')
        ) {
          return;
        }

        const returnedJSX = getReturnedJSXNode(renderItemExpression);
        if (!returnedJSX || returnedJSX.type !== 'JSXElement') return;

        const renderedComponentName = getJSXTagName(returnedJSX.openingElement.name);
        if (
          renderedComponentName &&
          memoizedComponentNames.has(renderedComponentName)
        ) {
          return;
        }

        context.report({
          node: renderItemAttribute ?? node,
          messageId: 'requireMemo',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./require-memo-for-list-item');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('require-memo-for-list-item', rule, {
//   valid: [{
//     filename: '/project/src/features/users/list.tsx',
//     code: `const UserItem = React.memo(({ user }) => <View />); <FlatList renderItem={({ item }) => <UserItem user={item} />} />;`,
//   }],
//   invalid: [{
//     filename: '/project/src/features/users/list.tsx',
//     code: `<FlatList renderItem={({ item }) => <View>{item.name}</View>} />;`,
//     errors: [{ messageId: 'requireMemo' }],
//   }],
// });
