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

  if (node.type === 'ArrowFunctionExpression' && node.body && node.body.type !== 'BlockStatement') {
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

function getDeclaredComponentNames(programNode) {
  const componentNames = new Set();

  for (const statement of programNode.body) {
    if (statement.type === 'FunctionDeclaration' && statement.id && functionReturnsJSX(statement)) {
      componentNames.add(statement.id.name);
    }

    if (statement.type !== 'VariableDeclaration') continue;

    for (const declaration of statement.declarations) {
      if (
        declaration.id.type === 'Identifier' &&
        declaration.init &&
        (declaration.init.type === 'ArrowFunctionExpression' ||
          declaration.init.type === 'FunctionExpression') &&
        functionReturnsJSX(declaration.init)
      ) {
        componentNames.add(declaration.id.name);
      }
    }
  }

  return componentNames;
}

function getExportedComponentNodes(programNode) {
  const componentNames = getDeclaredComponentNames(programNode);
  const exportedNodes = [];

  for (const statement of programNode.body) {
    if (statement.type === 'ExportNamedDeclaration') {
      const { declaration, specifiers } = statement;

      if (declaration?.type === 'FunctionDeclaration' && functionReturnsJSX(declaration)) {
        exportedNodes.push(statement);
      }

      if (declaration?.type === 'VariableDeclaration') {
        for (const variable of declaration.declarations) {
          if (
            variable.id.type === 'Identifier' &&
            variable.init &&
            (variable.init.type === 'ArrowFunctionExpression' ||
              variable.init.type === 'FunctionExpression') &&
            functionReturnsJSX(variable.init)
          ) {
            exportedNodes.push(statement);
          }
        }
      }

      for (const specifier of specifiers) {
        if (
          specifier.type === 'ExportSpecifier' &&
          specifier.local.type === 'Identifier' &&
          componentNames.has(specifier.local.name)
        ) {
          exportedNodes.push(statement);
        }
      }
    }

    if (statement.type !== 'ExportDefaultDeclaration') continue;

    const declaration = statement.declaration;

    if (
      (declaration.type === 'FunctionDeclaration' ||
        declaration.type === 'FunctionExpression' ||
        declaration.type === 'ArrowFunctionExpression') &&
      functionReturnsJSX(declaration)
    ) {
      exportedNodes.push(statement);
      continue;
    }

    if (declaration.type === 'Identifier' && componentNames.has(declaration.name)) {
      exportedNodes.push(statement);
    }
  }

  return exportedNodes;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '하나의 파일에서 export 되는 React 컴포넌트는 1개만 허용합니다.',
      recommended: false,
    },
    messages: {
      multipleExportedComponents:
        '하나의 파일에서 export 되는 컴포넌트는 1개만 허용됩니다. 파일을 분리하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      Program(node) {
        const exportedComponentNodes = getExportedComponentNodes(node);
        if (exportedComponentNodes.length <= 1) return;

        for (const exportedNode of exportedComponentNodes.slice(1)) {
          context.report({
            node: exportedNode,
            messageId: 'multipleExportedComponents',
          });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./no-multiple-components-in-file');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('no-multiple-components-in-file', rule, {
//   valid: [{
//     filename: '/project/src/components/header.tsx',
//     code: `const SubItem = () => <View />; export const Header = () => <SubItem />;`,
//   }],
//   invalid: [{
//     filename: '/project/src/components/layout.tsx',
//     code: `export const Header = () => <View />; export const Footer = () => <View />;`,
//     errors: [{ messageId: 'multipleExportedComponents' }],
//   }],
// });
