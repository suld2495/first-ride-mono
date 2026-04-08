'use strict'

const LOOP_METHODS = new Set(['forEach', 'map', 'filter', 'reduce'])

function isLoopMethodCallback(node) {
  const parent = node.parent
  if (!parent || parent.type !== 'CallExpression') {
    return false
  }

  return (
    parent.callee.type === 'MemberExpression' &&
    !parent.callee.computed &&
    parent.callee.property.type === 'Identifier' &&
    LOOP_METHODS.has(parent.callee.property.name)
  )
}

function isInsideLoop(node) {
  let current = node.parent

  while (current) {
    if (
      current.type === 'ForStatement' ||
      current.type === 'ForOfStatement' ||
      current.type === 'ForInStatement' ||
      current.type === 'WhileStatement' ||
      current.type === 'DoWhileStatement'
    ) {
      return true
    }

    if (
      (current.type === 'ArrowFunctionExpression' || current.type === 'FunctionExpression') &&
      isLoopMethodCallback(current)
    ) {
      return true
    }

    current = current.parent
  }

  return false
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '루프 안에서 정규식을 반복 생성하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      hoistRegexp:
        '루프 안에서 정규식을 반복 생성하지 마세요.\n 루프 밖에서 상수로 선언하세요.\n (예: const RE = /pattern/g)',
    },
  },

  create(context) {
    return {
      Literal(node) {
        if (node.regex && isInsideLoop(node)) {
          context.report({ node, messageId: 'hoistRegexp' })
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'RegExp' &&
          isInsideLoop(node)
        ) {
          context.report({ node, messageId: 'hoistRegexp' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./js-hoist-regexp')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('js-hoist-regexp', rule, {
    valid: [
      `const RE = /pattern/g; items.forEach(item => RE.test(item.name))`,
    ],
    invalid: [
      {
        code: `items.forEach(item => {
          const re = /pattern/g
          re.test(item.name)
        })`,
        errors: [{ messageId: 'hoistRegexp' }],
      },
      {
        code: `for (const item of items) {
          const re = new RegExp('test')
        }`,
        errors: [{ messageId: 'hoistRegexp' }],
      },
    ],
  })
*/
