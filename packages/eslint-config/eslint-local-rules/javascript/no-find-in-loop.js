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
    type: 'problem',
    docs: {
      description: '루프 안에서 .find() 또는 .findIndex() 호출을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidFindInLoop:
        '루프 안에서 .find()/.findIndex()를 사용하지 마세요. O(n²)입니다.\n 루프 전에 Map으로 인덱싱하세요.\n (예: const map = new Map(items.map(i => [i.id, i])))',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          !['find', 'findIndex'].includes(node.callee.property.name)
        ) {
          return
        }

        if (isInsideLoop(node)) {
          context.report({ node, messageId: 'avoidFindInLoop' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-find-in-loop')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('no-find-in-loop', rule, {
    valid: [
      `const user = users.find(u => u.id === id)`,
      `const userMap = new Map(users.map(u => [u.id, u])); orders.forEach(order => userMap.get(order.userId))`,
    ],
    invalid: [
      {
        code: `orders.forEach(order => {
          const user = users.find(u => u.id === order.userId)
        })`,
        errors: [{ messageId: 'avoidFindInLoop' }],
      },
      {
        code: `for (const order of orders) {
          users.findIndex(u => u.id === order.userId)
        }`,
        errors: [{ messageId: 'avoidFindInLoop' }],
      },
    ],
  })
*/
