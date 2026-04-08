'use strict'

function toStateName(setterName) {
  const tail = setterName.slice(3)
  if (!tail) {
    return null
  }

  return tail[0].toLowerCase() + tail.slice(1)
}

function collectPatternNames(pattern, names) {
  if (!pattern) {
    return
  }

  switch (pattern.type) {
    case 'Identifier':
      names.add(pattern.name)
      break
    case 'ObjectPattern':
      pattern.properties.forEach((property) => {
        if (property.type === 'Property') {
          collectPatternNames(property.value, names)
        } else if (property.type === 'RestElement') {
          collectPatternNames(property.argument, names)
        }
      })
      break
    case 'ArrayPattern':
      pattern.elements.forEach((element) => collectPatternNames(element, names))
      break
    case 'RestElement':
      collectPatternNames(pattern.argument, names)
      break
    case 'AssignmentPattern':
      collectPatternNames(pattern.left, names)
      break
    default:
      break
  }
}

function hasVariableInScope(node, name) {
  let current = node

  while (current) {
    if (current.type === 'Program' || current.type === 'BlockStatement') {
      for (const statement of current.body) {
        if (statement.type !== 'VariableDeclaration') {
          continue
        }

        for (const declaration of statement.declarations) {
          const names = new Set()
          collectPatternNames(declaration.id, names)
          if (names.has(name)) {
            return true
          }
        }
      }
    }

    if (
      current.type === 'FunctionDeclaration' ||
      current.type === 'FunctionExpression' ||
      current.type === 'ArrowFunctionExpression'
    ) {
      for (const param of current.params) {
        const names = new Set()
        collectPatternNames(param, names)
        if (names.has(name)) {
          return true
        }
      }
    }

    current = current.parent
  }

  return false
}

function containsIdentifier(node, targetName) {
  let found = false

  function visit(current) {
    if (!current || found) {
      return
    }

    if (current.type === 'Identifier' && current.name === targetName) {
      found = true
      return
    }

    if (current.type === 'MemberExpression' && !current.computed) {
      visit(current.object)
      return
    }

    for (const key of Object.keys(current)) {
      if (key === 'parent') {
        continue
      }

      const value = current[key]
      if (Array.isArray(value)) {
        value.forEach(visit)
      } else if (value && typeof value.type === 'string') {
        visit(value)
      }
    }
  }

  visit(node)
  return found
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '이전 state를 참조하는 setState 호출에는 함수형 업데이트를 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requireFunctionalUpdate:
        '이전 state를 참조하는 setState는 함수형 업데이트를 사용하세요.\n (예: setCount(c => c + 1))',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !/^set[A-Z0-9_]/.test(node.callee.name)) {
          return
        }

        const [argument] = node.arguments
        if (
          !argument ||
          argument.type === 'ArrowFunctionExpression' ||
          argument.type === 'FunctionExpression'
        ) {
          return
        }

        const stateName = toStateName(node.callee.name)
        if (!stateName || !hasVariableInScope(node, stateName)) {
          return
        }

        if (containsIdentifier(argument, stateName)) {
          context.report({ node, messageId: 'requireFunctionalUpdate' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./require-functional-setstate')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  })

  tester.run('require-functional-setstate', rule, {
    valid: [
      `setCount(c => c + 1)`,
      `setItems(prev => [...prev, newItem])`,
      `setCount(nextValue)`,
    ],
    invalid: [
      {
        code: `function Comp() {
          const [count, setCount] = useState(0)
          setCount(count + 1)
        }`,
        errors: [{ messageId: 'requireFunctionalUpdate' }],
      },
      {
        code: `function Comp() {
          const [items, setItems] = useState([])
          setItems([...items, newItem])
        }`,
        errors: [{ messageId: 'requireFunctionalUpdate' }],
      },
    ],
  })
*/
