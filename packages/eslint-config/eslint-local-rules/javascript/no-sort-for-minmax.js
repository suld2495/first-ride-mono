'use strict'

function isSortCall(node) {
  return (
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'sort'
  )
}

function isZeroLiteral(node) {
  return node && node.type === 'Literal' && node.value === 0
}

function isNegativeOne(node) {
  return (
    node &&
    ((node.type === 'Literal' && node.value === -1) ||
      (node.type === 'UnaryExpression' &&
        node.operator === '-' &&
        node.argument.type === 'Literal' &&
        node.argument.value === 1))
  )
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '정렬 후 첫 번째 또는 마지막 요소로 min/max를 구하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidSortForMinMax:
        '정렬로 최솟값/최댓값을 구하지 마세요. O(n log n)입니다.\n Math.max() 또는 Math.min()을 사용하세요.',
    },
  },

  create(context) {
    return {
      MemberExpression(node) {
        if (!node.computed || !isSortCall(node.object) || !isZeroLiteral(node.property)) {
          return
        }

        context.report({ node, messageId: 'avoidSortForMinMax' })
      },

      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'at' ||
          !isSortCall(node.callee.object)
        ) {
          return
        }

        const [indexArg] = node.arguments
        if (isZeroLiteral(indexArg) || isNegativeOne(indexArg)) {
          context.report({ node, messageId: 'avoidSortForMinMax' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-sort-for-minmax')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('no-sort-for-minmax', rule, {
    valid: [
      `const max = Math.max(...items)`,
      `const min = items.reduce((a, b) => a < b ? a : b)`,
    ],
    invalid: [
      {
        code: `const max = items.sort((a, b) => b - a)[0]`,
        errors: [{ messageId: 'avoidSortForMinMax' }],
      },
      {
        code: `const min = items.sort((a, b) => a - b).at(-1)`,
        errors: [{ messageId: 'avoidSortForMinMax' }],
      },
    ],
  })
*/
