'use strict'

function getLookupTarget(node) {
  if (
    node.callee.type !== 'MemberExpression' ||
    node.callee.computed ||
    node.callee.object.type !== 'Identifier' ||
    node.callee.property.type !== 'Identifier' ||
    !['find', 'filter'].includes(node.callee.property.name)
  ) {
    return null
  }

  return node.callee.object.name
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '같은 배열에 대한 반복 탐색을 금지하고 Map 인덱싱을 유도합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      preferIndexMap:
        '같은 배열을 반복 탐색하지 마세요.\n Map으로 인덱싱하여 O(1) 조회를 사용하세요.\n (예: const map = new Map(items.map(i => [i.id, i])))',
    },
  },

  create(context) {
    const callsByArray = new Map()

    return {
      CallExpression(node) {
        const target = getLookupTarget(node)
        if (!target) {
          return
        }

        if (!callsByArray.has(target)) {
          callsByArray.set(target, [])
        }

        callsByArray.get(target).push(node)
      },

      'Program:exit'() {
        for (const nodes of callsByArray.values()) {
          if (nodes.length < 3) {
            continue
          }

          nodes.forEach((node) => {
            context.report({ node, messageId: 'preferIndexMap' })
          })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./js-index-maps')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  })

  tester.run('js-index-maps', rule, {
    valid: [
      `const userMap = new Map(users.map(u => [u.id, u])); userMap.get(idA); userMap.get(idB)`,
      `const user = users.find(u => u.id === idA)`,
    ],
    invalid: [
      {
        code: `const userA = users.find(u => u.id === idA)
        const userB = users.find(u => u.id === idB)
        const userC = users.find(u => u.id === idC)`,
        errors: [
          { messageId: 'preferIndexMap' },
          { messageId: 'preferIndexMap' },
          { messageId: 'preferIndexMap' },
        ],
      },
    ],
  })
*/
