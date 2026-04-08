'use strict'

const ASYNC_CALL_NAMES = new Set(['fetch', 'axios'])

function collectStateSetters(programNode) {
  const setterMap = new Map()

  function visit(node) {
    if (!node) {
      return
    }

    if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'ArrayPattern' &&
      node.id.elements.length >= 2 &&
      node.id.elements[0] &&
      node.id.elements[0].type === 'Identifier' &&
      node.id.elements[1] &&
      node.id.elements[1].type === 'Identifier' &&
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee.type === 'Identifier' &&
      node.init.callee.name === 'useState'
    ) {
      setterMap.set(node.id.elements[1].name, node.id.elements[0].name)
    }

    for (const key of Object.keys(node)) {
      if (key === 'parent') {
        continue
      }

      const value = node[key]
      if (Array.isArray(value)) {
        value.forEach(visit)
      } else if (value && typeof value.type === 'string') {
        visit(value)
      }
    }
  }

  visit(programNode)
  return setterMap
}

function hasAsyncWork(node) {
  let found = false

  function visit(current) {
    if (!current || found) {
      return
    }

    if (current.type === 'AwaitExpression') {
      found = true
      return
    }

    if (current.type === 'CallExpression') {
      if (current.callee.type === 'Identifier' && ASYNC_CALL_NAMES.has(current.callee.name)) {
        found = true
        return
      }

      if (
        current.callee.type === 'MemberExpression' &&
        !current.callee.computed &&
        ((current.callee.object.type === 'Identifier' &&
          ASYNC_CALL_NAMES.has(current.callee.object.name)) ||
          ['then', 'catch', 'finally'].includes(current.callee.property.name))
      ) {
        found = true
        return
      }
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

function collectIdentifiers(node) {
  const names = new Set()

  function visit(current) {
    if (!current) {
      return
    }

    if (current.type === 'Identifier') {
      names.add(current.name)
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
  return names
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'useEffect 안에서 파생값을 setState로 저장하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      avoidDerivedStateInEffect:
        'useEffect 안에서 파생값을 setState로 저장하지 마세요.\n 렌더 중에 직접 계산하세요.\n (예: const fullName = first + \' \' + last)',
    },
  },

  create(context) {
    const setterMap = new Map()

    return {
      Program(node) {
        const collected = collectStateSetters(node)
        for (const [setterName, stateName] of collected) {
          setterMap.set(setterName, stateName)
        }
      },

      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useEffect') {
          return
        }

        const callback = node.arguments[0]
        if (
          !callback ||
          (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
        ) {
          return
        }

        if (hasAsyncWork(callback.body)) {
          return
        }

        const reports = []

        function inspect(current) {
          if (!current) {
            return
          }

          if (
            current.type === 'CallExpression' &&
            current.callee.type === 'Identifier' &&
            setterMap.has(current.callee.name) &&
            current.arguments.length === 1
          ) {
            const [argument] = current.arguments
            if (
              argument.type === 'ArrowFunctionExpression' ||
              argument.type === 'FunctionExpression'
            ) {
              return
            }

            const stateNames = new Set(setterMap.values())
            const identifiers = collectIdentifiers(argument)
            const referencedStates = [...identifiers].filter((name) => stateNames.has(name))

            if (referencedStates.length > 0) {
              const nonStateReferences = [...identifiers].filter(
                (name) =>
                  !stateNames.has(name) &&
                  name !== 'undefined' &&
                  name !== 'Math' &&
                  name !== current.callee.name
              )

              if (nonStateReferences.length === 0) {
                reports.push(current)
              }
            }
          }

          for (const key of Object.keys(current)) {
            if (key === 'parent') {
              continue
            }

            const value = current[key]
            if (Array.isArray(value)) {
              value.forEach(inspect)
            } else if (value && typeof value.type === 'string') {
              inspect(value)
            }
          }
        }

        inspect(callback.body)
        for (const target of reports) {
          context.report({ node: target, messageId: 'avoidDerivedStateInEffect' })
        }
      },
    }
  },
}

/*
  const { RuleTester } = require('eslint')
  const rule = require('./no-setstate-in-effect-for-derived')

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  })

  tester.run('no-setstate-in-effect-for-derived', rule, {
    valid: [
      `function Comp() {
        const [user, setUser] = useState(null)
        useEffect(() => {
          fetchUser().then(data => setUser(data))
        }, [])
      }`,
      `function Comp() {
        const [first] = useState('')
        const [last] = useState('')
        const fullName = first + ' ' + last
      }`,
    ],
    invalid: [
      {
        code: `function Comp() {
          const [first, setFirst] = useState('')
          const [last, setLast] = useState('')
          const [fullName, setFullName] = useState('')
          useEffect(() => {
            setFullName(first + ' ' + last)
          }, [first, last])
        }`,
        errors: [{ messageId: 'avoidDerivedStateInEffect' }],
      },
    ],
  })
*/
