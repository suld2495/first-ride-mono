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

function isDateNowCall(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Date' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'now'
  );
}

function isMathRandomCall(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'Math' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'random'
  );
}

function isNewDateExpression(node) {
  return node.callee.type === 'Identifier' && node.callee.name === 'Date';
}

function hasNestedFunctionAncestor(node, componentNode) {
  let current = node.parent;

  while (current && current !== componentNode) {
    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '컴포넌트 렌더 본문에서 Date.now(), Math.random(), new Date() 같은 불안정 값 생성을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noUnstableValueInRender:
        '렌더 본문에서 매번 달라지는 값을 만들지 마세요. useMemo/useRef 또는 이벤트 핸들러로 옮기세요.',
    },
  },

  create(context) {
    const componentStack = [];

    function enterFunction(node) {
      componentStack.push(isReactComponent(node) ? node : null);
    }

    function exitFunction() {
      componentStack.pop();
    }

    function getCurrentComponent() {
      for (let index = componentStack.length - 1; index >= 0; index -= 1) {
        if (componentStack[index]) {
          return componentStack[index];
        }
      }

      return null;
    }

    return {
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      CallExpression(node) {
        const currentComponent = getCurrentComponent();
        if (!currentComponent || hasNestedFunctionAncestor(node, currentComponent)) {
          return;
        }

        if (isDateNowCall(node) || isMathRandomCall(node)) {
          context.report({ node, messageId: 'noUnstableValueInRender' });
        }
      },

      NewExpression(node) {
        const currentComponent = getCurrentComponent();
        if (!currentComponent || hasNestedFunctionAncestor(node, currentComponent)) {
          return;
        }

        if (isNewDateExpression(node)) {
          context.report({ node, messageId: 'noUnstableValueInRender' });
        }
      },
    };
  },
};
