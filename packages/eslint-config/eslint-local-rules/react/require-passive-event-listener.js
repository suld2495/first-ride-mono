'use strict';

const TARGET_EVENTS = new Set([
  'scroll',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'wheel',
  'mousewheel',
]);

function isTargetEvent(node) {
  return node?.type === 'Literal' && typeof node.value === 'string' && TARGET_EVENTS.has(node.value);
}

function hasPassiveTrue(optionsNode) {
  if (!optionsNode || optionsNode.type !== 'ObjectExpression') {
    return false;
  }

  return optionsNode.properties.some((property) => {
    if (
      property.type !== 'Property' ||
      property.computed ||
      property.key.type !== 'Identifier' ||
      property.key.name !== 'passive'
    ) {
      return false;
    }

    return property.value.type === 'Literal' && property.value.value === true;
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'scroll/touch/wheel 이벤트 리스너에 passive 옵션을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requirePassiveEventListener:
        'scroll/touch/wheel 이벤트 리스너에는 { passive: true }를 추가하세요.\n 스크롤 성능에 직접 영향을 줍니다.\n (예: addEventListener(\'scroll\', handler, { passive: true }))',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'addEventListener'
        ) {
          return;
        }

        const [eventName, , options] = node.arguments;
        if (!isTargetEvent(eventName)) {
          return;
        }

        if (!options || !hasPassiveTrue(options)) {
          context.report({ node, messageId: 'requirePassiveEventListener' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./require-passive-event-listener');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('require-passive-event-listener', rule, {
    valid: [
      `element.addEventListener('scroll', handler, { passive: true });`,
      `element.addEventListener('wheel', handler, { passive: true, capture: true });`,
      `element.addEventListener('click', handler);`,
    ],
    invalid: [
      {
        code: `element.addEventListener('scroll', handler);`,
        errors: [{ messageId: 'requirePassiveEventListener' }],
      },
      {
        code: `element.addEventListener('touchmove', handler, false);`,
        errors: [{ messageId: 'requirePassiveEventListener' }],
      },
      {
        code: `element.addEventListener('wheel', handler, { capture: true });`,
        errors: [{ messageId: 'requirePassiveEventListener' }],
      },
    ],
  });
*/
