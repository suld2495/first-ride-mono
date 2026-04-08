'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function getJSXTagName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return nameNode.property.name;
  return null;
}

function getAttribute(node, attributeName) {
  return (
    node.attributes.find(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        attribute.name.type === 'JSXIdentifier' &&
        attribute.name.name === attributeName,
    ) ?? null
  );
}

function getAttributeExpression(attribute) {
  if (!attribute || !attribute.value || attribute.value.type !== 'JSXExpressionContainer') {
    return null;
  }

  return attribute.value.expression;
}

function getUseStateSetterNames(programNode) {
  const setterNames = new Set();

  for (const statement of programNode.body) {
    if (statement.type !== 'VariableDeclaration') continue;

    for (const declaration of statement.declarations) {
      if (
        declaration.id.type === 'ArrayPattern' &&
        declaration.id.elements.length >= 2 &&
        declaration.id.elements[1] &&
        declaration.id.elements[1].type === 'Identifier' &&
        declaration.init &&
        declaration.init.type === 'CallExpression' &&
        declaration.init.callee.type === 'Identifier' &&
        declaration.init.callee.name === 'useState'
      ) {
        setterNames.add(declaration.id.elements[1].name);
      }
    }
  }

  return setterNames;
}

function isSimpleSetterCall(expression, setterNames) {
  if (!expression) return false;

  if (expression.type === 'Identifier') {
    return setterNames.has(expression.name);
  }

  if (expression.type !== 'ArrowFunctionExpression' && expression.type !== 'FunctionExpression') {
    return false;
  }

  const [firstParameter] = expression.params;
  if (!firstParameter || firstParameter.type !== 'Identifier') return false;

  if (expression.body.type === 'CallExpression') {
    return isPassthroughSetterInvocation(expression.body, firstParameter.name, setterNames);
  }

  if (expression.body.type !== 'BlockStatement') return false;

  for (const statement of expression.body.body) {
    if (statement.type !== 'ExpressionStatement') continue;
    return isPassthroughSetterInvocation(statement.expression, firstParameter.name, setterNames);
  }

  return false;
}

function isPassthroughSetterInvocation(node, parameterName, setterNames) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    setterNames.has(node.callee.name) &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Identifier' &&
    node.arguments[0].name === parameterName
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '단순 controlled TextInput 사용을 금지하고 uncontrolled/ref 패턴을 유도합니다.',
      recommended: false,
    },
    messages: {
      noSimpleControlledTextInput:
        '단순 controlled TextInput은 RN에서 타이핑 지연을 유발합니다. defaultValue + ref 방식을 사용하거나 실시간 포맷팅이 필요한 경우만 controlled를 사용하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    let useStateSetterNames = new Set();

    return {
      Program(node) {
        useStateSetterNames = getUseStateSetterNames(node);
      },

      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (componentName !== 'TextInput') return;

        const valueAttribute = getAttribute(node, 'value');
        const onChangeTextAttribute = getAttribute(node, 'onChangeText');

        if (!valueAttribute || !onChangeTextAttribute) return;

        const onChangeExpression = getAttributeExpression(onChangeTextAttribute);
        if (!isSimpleSetterCall(onChangeExpression, useStateSetterNames)) return;

        context.report({
          node: onChangeTextAttribute,
          messageId: 'noSimpleControlledTextInput',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-controlled-textinput');
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
// tester.run('no-controlled-textinput', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: 'const MyInput = () => <TextInput defaultValue="init" onChangeText={handleChange} />;',
//     },
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: "const [text, setText] = useState(''); const MyInput = () => <TextInput value={text} onChangeText={(next) => setText(formatText(next))} />;",
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: "const [text, setText] = useState(''); const MyInput = () => <TextInput value={text} onChangeText={setText} />;",
//       errors: [{ messageId: 'noSimpleControlledTextInput' }],
//     },
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: "const [text, setText] = useState(''); const MyInput = () => <TextInput value={text} onChangeText={(value) => { setText(value); }} />;",
//       errors: [{ messageId: 'noSimpleControlledTextInput' }],
//     },
//   ],
// });
