'use strict'

function unwrapExpression(node) {
  if (!node) {
    return null
  }

  if (node.type === 'ChainExpression') {
    return unwrapExpression(node.expression)
  }

  return node
}

function getReturnedExpression(fn) {
  if (!fn || (fn.type !== 'ArrowFunctionExpression' && fn.type !== 'FunctionExpression')) {
    return null
  }

  if (fn.body.type !== 'BlockStatement') {
    return fn.body
  }

  const [statement] = fn.body.body
  if (
    fn.body.body.length === 1 &&
    statement &&
    statement.type === 'ReturnStatement' &&
    statement.argument
  ) {
    return statement.argument
  }

  return null
}

function isSimpleExpression(node) {
  const target = unwrapExpression(node)
  if (!target) {
    return false
  }

  switch (target.type) {
    case 'BinaryExpression':
    case 'LogicalExpression':
      return isSimpleExpression(target.left) && isSimpleExpression(target.right)
    case 'UnaryExpression':
      return isSimpleExpression(target.argument)
    case 'MemberExpression':
      return (
        isSimpleExpression(target.object) &&
        (!target.computed || isSimpleExpression(target.property))
      )
    case 'Identifier':
    case 'Literal':
    case 'ThisExpression':
      return true
    case 'TemplateLiteral':
      return target.expressions.every(isSimpleExpression)
    default:
      return false
  }
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '단순 표현식을 useMemo로 감싸는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidTrivialUseMemo:
        '단순 표현식에 useMemo를 사용하지 마세요.\n 메모이제이션 비용이 계산 비용보다 큽니다.\n 그냥 변수로 선언하세요.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useMemo') {
          return
        }

        const expression = getReturnedExpression(node.arguments[0])
        if (!expression) {
          return
        }

        if (isSimpleExpression(expression)) {
          context.report({ node, messageId: 'avoidTrivialUseMemo' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-trivial-usememo')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  })

  tester.run('no-trivial-usememo', rule, {
    valid: [
      `const filtered = useMemo(() => items.filter(i => i.active).map(i => i.id), [items])`,
      `const sorted = useMemo(() => {
        return [...items].sort(compare)
      }, [items])`,
    ],
    invalid: [
      {
        code: `const isLoading = useMemo(() => a.isLoading || b.isLoading, [a, b])`,
        errors: [{ messageId: 'avoidTrivialUseMemo' }],
      },
      {
        code: `const total = useMemo(() => price + tax, [price, tax])`,
        errors: [{ messageId: 'avoidTrivialUseMemo' }],
      },
    ],
  })
*/
