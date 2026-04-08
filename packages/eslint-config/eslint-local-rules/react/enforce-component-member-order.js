'use strict';

/**
 * 컴포넌트 내부 선언 순서
 * 1: props 구조분해
 * 2: useState, useReducer
 * 3: useRef
 * 4: useContext, 커스텀 훅 (use*)
 * 5: useMemo, useCallback
 * 6: useEffect, useLayoutEffect
 * 7: 이벤트 핸들러 (handle*)
 * 8: 파생 변수
 * 9: return
 */
const ORDER = {
  propsDestructure: 1,
  stateHooks: 2,
  refHooks: 3,
  contextAndCustomHooks: 4,
  memoHooks: 5,
  effectHooks: 6,
  eventHandlers: 7,
  derivedVars: 8,
  returnStatement: 9,
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '컴포넌트 내부 선언 순서를 강제합니다: hooks → 핸들러 → return',
      recommended: false,
    },
    messages: {
      wrongOrder: '컴포넌트 내부 선언 순서를 지켜주세요: hooks → 핸들러 → return',
    },
    schema: [],
  },

  create(context) {
    function getCalleeName(callExpr) {
      const { callee } = callExpr;
      if (callee.type === 'Identifier') return callee.name;
      if (callee.type === 'MemberExpression' && !callee.computed) {
        return callee.property.name;
      }
      return null;
    }

    function getStatementCategory(node) {
      if (node.type === 'ReturnStatement') return ORDER.returnStatement;

      if (node.type === 'ExpressionStatement') {
        if (node.expression.type === 'CallExpression') {
          const name = getCalleeName(node.expression);
          if (name === 'useEffect' || name === 'useLayoutEffect') {
            return ORDER.effectHooks;
          }
        }
        return null;
      }

      if (node.type !== 'VariableDeclaration') return null;

      const decl = node.declarations[0];
      if (!decl) return null;

      const { id, init } = decl;

      // props 구조분해: const { x } = props
      if (
        id.type === 'ObjectPattern' &&
        init &&
        init.type === 'Identifier' &&
        init.name === 'props'
      ) {
        return ORDER.propsDestructure;
      }

      if (init && init.type === 'CallExpression') {
        const name = getCalleeName(init);
        if (!name) return ORDER.derivedVars;

        if (name === 'useState' || name === 'useReducer') return ORDER.stateHooks;
        if (name === 'useRef') return ORDER.refHooks;
        if (name === 'useMemo' || name === 'useCallback') return ORDER.memoHooks;
        if (name === 'useContext') return ORDER.contextAndCustomHooks;
        // 커스텀 훅 (use로 시작, 4자 이상)
        if (name.startsWith('use') && name.length > 3) return ORDER.contextAndCustomHooks;
      }

      // 이벤트 핸들러: const handle* = ...
      if (id.type === 'Identifier' && /^handle[A-Z_]/.test(id.name)) {
        return ORDER.eventHandlers;
      }

      return ORDER.derivedVars;
    }

    function hasJSXReturn(statements) {
      for (const stmt of statements) {
        if (
          stmt.type === 'ReturnStatement' &&
          stmt.argument &&
          (stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment')
        ) {
          return true;
        }
      }
      return false;
    }

    function checkComponentBody(node) {
      const body = node.body;
      if (!body || body.type !== 'BlockStatement') return;

      const { body: statements } = body;
      if (!hasJSXReturn(statements)) return;

      let maxCategorySeenSoFar = 0;

      for (const stmt of statements) {
        const category = getStatementCategory(stmt);
        if (category === null) continue;

        if (category < maxCategorySeenSoFar) {
          context.report({ node: stmt, messageId: 'wrongOrder' });
          return; // 첫 번째 위반 지점만 리포트
        }

        maxCategorySeenSoFar = Math.max(maxCategorySeenSoFar, category);
      }
    }

    return {
      FunctionDeclaration: checkComponentBody,
      ArrowFunctionExpression: checkComponentBody,
      FunctionExpression: checkComponentBody,
    };
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ───────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rule = require('./enforce-component-member-order');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('enforce-component-member-order', rule, {
    valid: [
      // 올바른 순서
      `const MyComponent = () => {
        const [count, setCount] = useState(0);
        const ref = useRef(null);
        const value = useContext(MyContext);
        const memoVal = useMemo(() => count * 2, [count]);
        useEffect(() => {}, [count]);
        const handlePress = () => {};
        const derived = count + 1;
        return <View />;
      }`,

      // 컴포넌트가 아닌 함수 (JSX 반환 없음)
      `function helper() {
        const handlePress = () => {};
        const [count, setCount] = useState(0);
      }`,
    ],

    invalid: [
      // 핸들러가 hooks보다 먼저 선언
      {
        code: `const MyComponent = () => {
          const handlePress = () => {};
          const [count, setCount] = useState(0);
          return <View />;
        }`,
        errors: [{ messageId: 'wrongOrder' }],
      },

      // useEffect가 이벤트 핸들러보다 먼저 선언
      {
        code: `const MyComponent = () => {
          const handlePress = () => {};
          useEffect(() => {}, []);
          return <View />;
        }`,
        errors: [{ messageId: 'wrongOrder' }],
      },
    ],
  });
*/
