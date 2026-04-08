'use strict'

function getCalleePropertyName(node) {
  if (
    !node ||
    node.type !== 'CallExpression' ||
    node.callee.type !== 'MemberExpression' ||
    node.callee.computed ||
    node.callee.property.type !== 'Identifier'
  ) {
    return null
  }

  return node.callee.property.name
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '.map().filter() 및 .filter().map() 대신 .flatMap() 사용을 권장합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      preferFlatMap:
        '.map().filter() 또는 .filter().map() 대신 .flatMap()을 사용하세요.\n 배열 순회 횟수를 줄일 수 있습니다.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const currentName = getCalleePropertyName(node)
        if (!currentName || !['map', 'filter'].includes(currentName)) {
          return
        }

        const objectCall = node.callee.object
        const previousName = getCalleePropertyName(objectCall)
        if (!previousName || previousName === currentName) {
          return
        }

        context.report({ node, messageId: 'preferFlatMap' })
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./prefer-flatmap')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('prefer-flatmap', rule, {
    valid: [
      `items.flatMap(x => x ? [x] : [])`,
      `items.map(transform)`,
    ],
    invalid: [
      {
        code: `items.map(transform).filter(Boolean)`,
        errors: [{ messageId: 'preferFlatMap' }],
      },
      {
        code: `items.filter(isActive).map(toLabel)`,
        errors: [{ messageId: 'preferFlatMap' }],
      },
    ],
  })
*/
