'use strict'

function isAllowedInitializer(node) {
  if (!node) {
    return true
  }

  switch (node.type) {
    case 'Literal':
    case 'Identifier':
    case 'ArrayExpression':
    case 'ObjectExpression':
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return true
    default:
      return false
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'useState에 함수 호출 결과를 직접 전달하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidCallResult:
        'useState에 함수 호출 결과를 직접 전달하지 마세요.\n 렌더마다 실행됩니다. 함수 참조로 전달하세요.\n (예: useState(() => buildSearchIndex(items)))',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useState') {
          return
        }

        const [argument] = node.arguments
        if (!argument || isAllowedInitializer(argument)) {
          return
        }

        if (argument.type === 'CallExpression') {
          context.report({ node: argument, messageId: 'avoidCallResult' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-function-call-in-usestate')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  })

  tester.run('no-function-call-in-usestate', rule, {
    valid: [
      `const [state] = useState(() => buildSearchIndex(items))`,
      `const [count] = useState(0)`,
      `const [value] = useState(someVariable)`,
    ],
    invalid: [
      {
        code: `const [state] = useState(buildSearchIndex(items))`,
        errors: [{ messageId: 'avoidCallResult' }],
      },
      {
        code: `const [state] = useState(parseJSON(data))`,
        errors: [{ messageId: 'avoidCallResult' }],
      },
    ],
  })
*/
