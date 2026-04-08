'use strict';

function getClassNameValue(node) {
  const classAttribute = node.attributes.find(
    (attribute) =>
      attribute?.type === 'JSXAttribute' &&
      attribute.name?.type === 'JSXIdentifier' &&
      attribute.name.name === 'className'
  );

  if (!classAttribute || !classAttribute.value) {
    return null;
  }

  if (classAttribute.value.type === 'Literal' && typeof classAttribute.value.value === 'string') {
    return classAttribute.value.value;
  }

  if (
    classAttribute.value.type === 'JSXExpressionContainer' &&
    classAttribute.value.expression.type === 'Literal' &&
    typeof classAttribute.value.expression.value === 'string'
  ) {
    return classAttribute.value.expression.value;
  }

  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '<svg>에 직접 애니메이션 클래스를 적용하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noAnimateSvgDirectly:
        '<svg>에 직접 애니메이션 클래스를 적용하지 마세요.\n wrapper div에 적용하세요.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'svg') {
          return;
        }

        const classNameValue = getClassNameValue(node);
        if (
          classNameValue &&
          ['animate-', 'transition-', 'motion-'].some((token) => classNameValue.includes(token))
        ) {
          context.report({ node, messageId: 'noAnimateSvgDirectly' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-animate-svg-directly');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('no-animate-svg-directly', rule, {
    valid: [
      `const App = () => <div className="animate-spin"><svg /></div>;`,
      `const App = () => <svg />;`,
    ],
    invalid: [
      {
        code: `const App = () => <svg className="animate-spin" />;`,
        errors: [{ messageId: 'noAnimateSvgDirectly' }],
      },
      {
        code: `const App = () => <svg className="transition-all size-4" />;`,
        errors: [{ messageId: 'noAnimateSvgDirectly' }],
      },
    ],
  });
*/
