'use strict';
const {
  isApiLayerFile,
  isHooksFile,
  normalizePath,
} = require('../path-groups');

/** interceptor 파일(api-client.ts 등)은 제외 */
function isApiLayerFileExcludingInterceptor(context, filename) {
  if (/api-client\.(ts|tsx|js|jsx)$/.test(normalizePath(filename))) return false;
  return isApiLayerFile(context, filename);
}

// ──────────────────────────────────────────────────────────────
// Rule 1: require-mutation-error-handler
// ──────────────────────────────────────────────────────────────
const requireMutationErrorHandler = {
  meta: {
    type: 'problem',
    docs: {
      description: 'useMutation 에는 반드시 onError 핸들러를 명시하세요.',
      recommended: false,
    },
    messages: {
      missingOnError: 'useMutation 에는 반드시 onError 핸들러를 명시하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isHooksFile(context, filename)) return {};

    return {
      CallExpression(node) {
        // useMutation(...) 호출인지 확인
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'useMutation'
        ) {
          return;
        }

        const firstArg = node.arguments[0];
        if (!firstArg || firstArg.type !== 'ObjectExpression') return;

        const hasOnError = firstArg.properties.some(
          (prop) =>
            prop.type === 'Property' &&
            !prop.computed &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'onError',
        );

        if (!hasOnError) {
          context.report({ node, messageId: 'missingOnError' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 2: require-try-catch-in-api-layer
// ──────────────────────────────────────────────────────────────
const requireTryCatchInApiLayer = {
  meta: {
    type: 'problem',
    docs: {
      description: 'api 레이어의 async 함수는 반드시 try-catch 로 감싸야 합니다.',
      recommended: false,
    },
    messages: {
      requireTryCatch: 'api 레이어의 async 함수는 반드시 try-catch 로 감싸야 합니다.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isApiLayerFile(context, filename)) return {};

    /**
     * async 함수 스택.
     * hasAwait: 해당 함수 내부에 직접(nested 함수 제외) await 가 있는지 추적.
     */
    const funcStack = [];

    function enterFunc(node) {
      if (node.async) {
        funcStack.push({ node, hasAwait: false });
      }
    }

    function exitFunc(node) {
      if (!node.async) return;
      const frame = funcStack.pop();
      if (!frame || !frame.hasAwait) return;

      // body 가 BlockStatement 인 경우만 검사
      const body = node.body;
      if (!body || body.type !== 'BlockStatement') return;

      const hasTryCatch = body.body.some((stmt) => stmt.type === 'TryStatement');
      if (!hasTryCatch) {
        context.report({ node, messageId: 'requireTryCatch' });
      }
    }

    return {
      FunctionDeclaration: enterFunc,
      'FunctionDeclaration:exit': exitFunc,
      FunctionExpression: enterFunc,
      'FunctionExpression:exit': exitFunc,
      ArrowFunctionExpression: enterFunc,
      'ArrowFunctionExpression:exit': exitFunc,

      AwaitExpression() {
        // 가장 안쪽 async 함수에 await 표시
        if (funcStack.length > 0) {
          funcStack[funcStack.length - 1].hasAwait = true;
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 3: require-api-error-throw
// ──────────────────────────────────────────────────────────────
const requireApiErrorThrow = {
  meta: {
    type: 'problem',
    docs: {
      description: 'catch 블록에서 반드시 new ApiError(error) 를 throw 하세요.',
      recommended: false,
    },
    messages: {
      requireApiErrorThrow:
        'catch 블록에서 반드시 new ApiError(error) 를 throw 하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isApiLayerFile(context, filename)) return {};

    function isApiErrorThrow(throwStmt) {
      const arg = throwStmt.argument;
      return (
        arg &&
        arg.type === 'NewExpression' &&
        arg.callee.type === 'Identifier' &&
        arg.callee.name === 'ApiError'
      );
    }

    return {
      CatchClause(node) {
        const statements = node.body.body;

        // 최상위 ThrowStatement 목록 수집
        const throwStatements = statements.filter(
          (stmt) => stmt.type === 'ThrowStatement',
        );

        // throw 자체가 없으면 에러
        if (throwStatements.length === 0) {
          context.report({ node, messageId: 'requireApiErrorThrow' });
          return;
        }

        // throw 가 있지만 모두 ApiError 가 아니면 에러
        const hasApiErrorThrow = throwStatements.some(isApiErrorThrow);
        if (!hasApiErrorThrow) {
          context.report({ node, messageId: 'requireApiErrorThrow' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 4: no-http-status-in-api-layer
// ──────────────────────────────────────────────────────────────
const COMMON_HTTP_STATUS = new Set([
  400, 401, 403, 404, 405, 408, 409, 429, 500, 502, 503, 504,
]);

const COMPARISON_OPERATORS = new Set(['===', '!==', '==', '!=', '>', '<', '>=', '<=']);

/**
 * 노드가 .status 멤버 접근인지 확인.
 * ChainExpression(optional chaining) 도 처리.
 */
function isStatusAccess(node) {
  if (!node) return false;
  const inner = node.type === 'ChainExpression' ? node.expression : node;
  return (
    inner.type === 'MemberExpression' &&
    !inner.computed &&
    inner.property?.type === 'Identifier' &&
    inner.property.name === 'status'
  );
}

const noHttpStatusInApiLayer = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'api 레이어에서 공통 HTTP 상태코드를 직접 처리하지 마세요.',
      recommended: false,
    },
    messages: {
      noHttpStatus:
        'api 레이어에서 공통 HTTP 상태코드를 직접 처리하지 마세요.\n' +
        ' 401, 403 등 공통 에러는 src/services/api-client.ts 의 interceptor 에서 처리하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isApiLayerFileExcludingInterceptor(context, filename)) return {};

    return {
      // error.response.status === 401 / error.response?.status !== 403 등
      BinaryExpression(node) {
        if (!COMPARISON_OPERATORS.has(node.operator)) return;

        const { left, right } = node;
        const leftStatus = isStatusAccess(left);
        const rightStatus = isStatusAccess(right);

        if (
          leftStatus &&
          right.type === 'Literal' &&
          COMMON_HTTP_STATUS.has(right.value)
        ) {
          context.report({ node, messageId: 'noHttpStatus' });
          return;
        }

        if (
          rightStatus &&
          left.type === 'Literal' &&
          COMMON_HTTP_STATUS.has(left.value)
        ) {
          context.report({ node, messageId: 'noHttpStatus' });
        }
      },

      // switch (error.response.status) { case 404: ... }
      SwitchStatement(node) {
        if (!isStatusAccess(node.discriminant)) return;

        const hasHttpCase = node.cases.some(
          (c) =>
            c.test &&
            c.test.type === 'Literal' &&
            COMMON_HTTP_STATUS.has(c.test.value),
        );

        if (hasHttpCase) {
          context.report({ node, messageId: 'noHttpStatus' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────
module.exports = {
  rules: {
    'require-mutation-error-handler': requireMutationErrorHandler,
    'require-try-catch-in-api-layer': requireTryCatchInApiLayer,
    'require-api-error-throw': requireApiErrorThrow,
    'no-http-status-in-api-layer': noHttpStatusInApiLayer,
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ─────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rules = require('./api-error-handling').rules;

  const opts = { languageOptions: { ecmaVersion: 2022, sourceType: 'module' } };
  const HOOKS  = '/project/src/features/auth/hooks/useAuth.ts';
  const API    = '/project/src/features/auth/api/auth.api.ts';
  const SVC    = '/project/src/services/user.service.ts';
  const CLIENT = '/project/src/services/api-client.ts';

  // ── require-mutation-error-handler ──────────────────────────
  new RuleTester(opts).run('require-mutation-error-handler', rules['require-mutation-error-handler'], {
    valid: [
      {
        code: `useMutation({ mutationFn: fn, onError: (e) => handle(e) });`,
        filename: HOOKS,
      },
      {
        // useMutation 이지만 hooks 파일이 아닌 경우 무시
        code: `useMutation({ mutationFn: fn });`,
        filename: API,
      },
    ],
    invalid: [
      {
        code: `useMutation({ mutationFn: fn, onSuccess: (d) => setUser(d) });`,
        filename: HOOKS,
        errors: [{ messageId: 'missingOnError' }],
      },
    ],
  });

  // ── require-try-catch-in-api-layer ──────────────────────────
  new RuleTester(opts).run('require-try-catch-in-api-layer', rules['require-try-catch-in-api-layer'], {
    valid: [
      {
        code: `const authApi = { login: async (d) => { try { return await axios.post('/login', d); } catch(e) { throw new ApiError(e); } } };`,
        filename: API,
      },
      {
        // await 없는 async 함수 → 검사 제외
        code: `async function noAwait() { return 42; }`,
        filename: API,
      },
      {
        // api 레이어 아닌 파일 → 무시
        code: `async function fn() { await something(); }`,
        filename: HOOKS,
      },
    ],
    invalid: [
      {
        code: `const authApi = { login: async (d) => { const res = await axios.post('/login', d); return res.data; } };`,
        filename: API,
        errors: [{ messageId: 'requireTryCatch' }],
      },
      {
        code: `async function getUser() { const res = await axios.get('/user'); return res.data; }`,
        filename: SVC,
        errors: [{ messageId: 'requireTryCatch' }],
      },
    ],
  });

  // ── require-api-error-throw ──────────────────────────────────
  new RuleTester(opts).run('require-api-error-throw', rules['require-api-error-throw'], {
    valid: [
      {
        code: `try {} catch (e) { throw new ApiError(e); }`,
        filename: API,
      },
      {
        code: `try {} catch (e) { console.error(e); throw new ApiError(e); }`,
        filename: API,
      },
    ],
    invalid: [
      {
        // 빈 catch
        code: `try {} catch (e) {}`,
        filename: API,
        errors: [{ messageId: 'requireApiErrorThrow' }],
      },
      {
        // console 만 있는 catch
        code: `try {} catch (e) { console.error(e); }`,
        filename: API,
        errors: [{ messageId: 'requireApiErrorThrow' }],
      },
      {
        // ApiError 가 아닌 throw
        code: `try {} catch (e) { throw new Error(e); }`,
        filename: API,
        errors: [{ messageId: 'requireApiErrorThrow' }],
      },
      {
        // 원본 에러 그대로 throw
        code: `try {} catch (e) { throw e; }`,
        filename: API,
        errors: [{ messageId: 'requireApiErrorThrow' }],
      },
    ],
  });

  // ── no-http-status-in-api-layer ─────────────────────────────
  new RuleTester(opts).run('no-http-status-in-api-layer', rules['no-http-status-in-api-layer'], {
    valid: [
      {
        // interceptor 파일은 허용
        code: `if (error.response.status === 401) redirectToLogin();`,
        filename: CLIENT,
      },
      {
        // 공통 상태코드가 아닌 값 (200)
        code: `if (error.response.status === 200) {}`,
        filename: API,
      },
    ],
    invalid: [
      {
        code: `if (error.response.status === 401) redirectToLogin();`,
        filename: API,
        errors: [{ messageId: 'noHttpStatus' }],
      },
      {
        code: `if (error.response?.status === 403) showForbidden();`,
        filename: SVC,
        errors: [{ messageId: 'noHttpStatus' }],
      },
      {
        code: `switch (error.response.status) { case 404: break; }`,
        filename: API,
        errors: [{ messageId: 'noHttpStatus' }],
      },
    ],
  });
*/
