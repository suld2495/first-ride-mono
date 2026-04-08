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

function isStringLike(node) {
  return (
    (node.type === 'Literal' && typeof node.value === 'string') ||
    (node.type === 'TemplateLiteral' && node.expressions.length === 0)
  )
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '루프 안에서 배열 .includes() 호출을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidIncludesInLoop:
        '루프 안에서 .includes()를 사용하지 마세요. O(n²)입니다.\n Set으로 변환하여 .has()를 사용하세요.\n (예: const set = new Set(arr); set.has(value))',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'includes'
        ) {
          return
        }

        if (isStringLike(node.callee.object) || !isInsideLoop(node)) {
          return
        }

        context.report({ node, messageId: 'avoidIncludesInLoop' })
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-includes-in-loop')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('no-includes-in-loop', rule, {
    valid: [
      `const allowed = new Set(allowedIds); items.forEach(item => allowed.has(item.id))`,
      `for (const item of items) { if ('abc'.includes(item.kind)) {} }`,
    ],
    invalid: [
      {
        code: `items.forEach(item => {
          if (allowedIds.includes(item.id)) {}
        })`,
        errors: [{ messageId: 'avoidIncludesInLoop' }],
      },
      {
        code: `for (const item of items) {
          blockedList.includes(item.name)
        }`,
        errors: [{ messageId: 'avoidIncludesInLoop' }],
      },
    ],
  })
*/
