'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function getCalleeName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }
  return null;
}

function getJSXTagName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') {
    const objectName = nameNode.object.type === 'JSXIdentifier' ? nameNode.object.name : null;
    const propertyName = nameNode.property.type === 'JSXIdentifier' ? nameNode.property.name : null;

    return objectName && propertyName ? `${objectName}.${propertyName}` : propertyName;
  }
  return null;
}

function getStyleExpression(attribute) {
  if (
    !attribute ||
    attribute.type !== 'JSXAttribute' ||
    attribute.name.type !== 'JSXIdentifier' ||
    attribute.name.name !== 'style' ||
    !attribute.value ||
    attribute.value.type !== 'JSXExpressionContainer'
  ) {
    return null;
  }

  return attribute.value.expression;
}

function collectAnimatedStyleNames(programNode) {
  const animatedStyleNames = new Set();

  for (const statement of programNode.body) {
    if (statement.type !== 'VariableDeclaration') continue;

    for (const declaration of statement.declarations) {
      if (
        declaration.id.type === 'Identifier' &&
        declaration.init?.type === 'CallExpression' &&
        getCalleeName(declaration.init.callee) === 'useAnimatedStyle'
      ) {
        animatedStyleNames.add(declaration.id.name);
      }
    }
  }

  return animatedStyleNames;
}

function expressionUsesAnimatedStyle(expression, animatedStyleNames) {
  if (!expression) return false;

  if (expression.type === 'Identifier') {
    return animatedStyleNames.has(expression.name);
  }

  if (expression.type !== 'ArrayExpression') return false;

  return expression.elements.some(
    (element) => element?.type === 'Identifier' && animatedStyleNames.has(element.name),
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'useAnimatedStyle 결과는 Animated 컴포넌트에만 전달되도록 강제합니다.',
      recommended: false,
    },
    messages: {
      requireAnimatedComponent:
        'useAnimatedStyle 결과는 Animated.View, Animated.Text 등 Animated 컴포넌트에만 전달하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    let animatedStyleNames = new Set();

    return {
      Program(node) {
        animatedStyleNames = collectAnimatedStyleNames(node);
      },

      JSXOpeningElement(node) {
        const styleAttribute = node.attributes.find((attribute) => getStyleExpression(attribute));
        const styleExpression = getStyleExpression(styleAttribute);
        if (!expressionUsesAnimatedStyle(styleExpression, animatedStyleNames)) return;

        const componentName = getJSXTagName(node.name);
        if (componentName?.startsWith('Animated.')) return;

        context.report({
          node: styleAttribute ?? node,
          messageId: 'requireAnimatedComponent',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-reanimated-style-on-view');
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
// tester.run('no-reanimated-style-on-view', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 })); <Animated.View style={animatedStyle} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 })); <View style={animatedStyle} />;',
//       errors: [{ messageId: 'requireAnimatedComponent' }],
//     },
//   ],
// });
