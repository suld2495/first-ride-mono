'use strict';

const TARGET_TEXT_COMPONENTS = new Set(['Text']);
const TARGET_LITERAL_PROPS = new Set(['title', 'label', 'placeholder', 'accessibilityLabel']);

function isMeaningfulText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getJSXElementName(node) {
  if (!node) return null;

  if (node.type === 'JSXIdentifier') {
    return node.name;
  }

  if (node.type === 'JSXMemberExpression') {
    return node.property.name;
  }

  return null;
}

function isTranslationCall(node) {
  return (
    node?.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 't'
  );
}

function isTargetTextElement(node) {
  const elementName = getJSXElementName(node.openingElement?.name);
  return TARGET_TEXT_COMPONENTS.has(elementName);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '사용자에게 직접 노출되는 UI 문자열은 번역 함수나 상수를 사용하도록 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noUserFacingLiteralString:
        '사용자 노출 문자열은 하드코딩하지 말고 t(...) 또는 상수/변수를 사용하세요.',
    },
  },

  create(context) {
    return {
      JSXText(node) {
        if (!isMeaningfulText(node.value)) {
          return;
        }

        if (
          node.parent?.type === 'JSXElement' &&
          node.parent.children.length === 1 &&
          isTargetTextElement(node.parent)
        ) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
        }
      },

      JSXExpressionContainer(node) {
        if (
          node.expression.type === 'Literal' &&
          isMeaningfulText(node.expression.value) &&
          node.parent?.type === 'JSXElement' &&
          isTargetTextElement(node.parent)
        ) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
          return;
        }

        if (
          node.expression.type === 'TemplateLiteral' &&
          node.expression.expressions.length === 0 &&
          isMeaningfulText(node.expression.quasis[0]?.value.cooked) &&
          node.parent?.type === 'JSXElement' &&
          isTargetTextElement(node.parent)
        ) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
        }
      },

      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !TARGET_LITERAL_PROPS.has(node.name.name)) {
          return;
        }

        if (node.value?.type === 'Literal' && isMeaningfulText(node.value.value)) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
          return;
        }

        if (
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'Literal' &&
          isMeaningfulText(node.value.expression.value)
        ) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
          return;
        }

        if (
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'TemplateLiteral' &&
          node.value.expression.expressions.length === 0 &&
          isMeaningfulText(node.value.expression.quasis[0]?.value.cooked)
        ) {
          context.report({ node, messageId: 'noUserFacingLiteralString' });
        }
      },

      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.object.type !== 'Identifier' ||
          node.callee.object.name !== 'Alert' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'alert'
        ) {
          return;
        }

        for (const argument of node.arguments) {
          if (isTranslationCall(argument)) {
            continue;
          }

          if (argument.type === 'Literal' && isMeaningfulText(argument.value)) {
            context.report({ node: argument, messageId: 'noUserFacingLiteralString' });
          }
        }
      },
    };
  },
};
