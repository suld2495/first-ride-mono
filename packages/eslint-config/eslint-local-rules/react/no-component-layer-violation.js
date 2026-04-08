'use strict';
const { isComponentFile } = require('../path-groups');

// ──────────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Rule 1: no-async-in-component
// ──────────────────────────────────────────────────────────────
const noAsyncInComponent = {
  meta: {
    type: 'problem',
    docs: {
      description: 'components 레이어에서는 비동기 로직을 직접 사용할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noAsyncInComponent:
        'components 레이어에서는 비동기 로직(async/await/fetch/axios)을 직접 사용할 수 없습니다.\n' +
        ' 비동기 로직은 hooks 레이어로 위임하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isComponentFile(context, filename)) return {};

    function report(node) {
      context.report({ node, messageId: 'noAsyncInComponent' });
    }

    function isAxiosCall(node) {
      const { callee } = node;
      if (callee.type === 'MemberExpression') {
        return callee.object.type === 'Identifier' && callee.object.name === 'axios';
      }
      return callee.type === 'Identifier' && callee.name === 'axios';
    }

    function isFetchCall(node) {
      return node.callee.type === 'Identifier' && node.callee.name === 'fetch';
    }

    return {
      // async 함수 선언/표현식
      'FunctionDeclaration[async=true]': report,
      'FunctionExpression[async=true]': report,
      'ArrowFunctionExpression[async=true]': report,

      // await 표현식
      AwaitExpression: report,

      // fetch() / axios 호출
      CallExpression(node) {
        if (isFetchCall(node) || isAxiosCall(node)) {
          report(node);
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 2: no-data-transform-in-component
// ──────────────────────────────────────────────────────────────
const ARRAY_TRANSFORM_METHODS = new Set([
  'filter', 'map', 'reduce', 'reduceRight',
  'find', 'findIndex', 'findLast', 'findLastIndex',
  'forEach', 'some', 'every', 'flatMap', 'sort', 'flat',
]);

/** CallExpression 기준으로 배열 메서드 체인 깊이를 반환 */
function getArrayChainDepth(node) {
  if (node.type !== 'CallExpression') return 0;
  if (node.callee.type !== 'MemberExpression') return 0;

  const prop = node.callee.property;
  if (prop.type !== 'Identifier' || !ARRAY_TRANSFORM_METHODS.has(prop.name)) return 0;

  return 1 + getArrayChainDepth(node.callee.object);
}

/** 부모가 더 큰 체인의 일부인지 확인 (중복 리포트 방지) */
function isNestedChainNode(node) {
  const parent = node.parent;
  return (
    parent &&
    parent.type === 'MemberExpression' &&
    parent.object === node &&
    parent.parent &&
    parent.parent.type === 'CallExpression'
  );
}

const noDataTransformInComponent = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'components 레이어에서는 배열 메서드 체이닝을 2개 이상 사용할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noDataTransformInComponent:
        'components 레이어에서는 배열 메서드 체이닝을 2개 이상 사용할 수 없습니다.\n' +
        ' 데이터 변환 로직은 hooks 또는 유틸리티 함수로 분리하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isComponentFile(context, filename)) return {};

    return {
      CallExpression(node) {
        const depth = getArrayChainDepth(node);
        if (depth >= 2 && !isNestedChainNode(node)) {
          context.report({ node, messageId: 'noDataTransformInComponent' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 3: no-deep-logic-in-component
// ──────────────────────────────────────────────────────────────
const noDeepLogicInComponent = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'components 레이어에서는 제어문 중첩을 3단계 이상 사용할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noDeepLogicInComponent:
        'components 레이어에서는 제어문(if/for/while/switch)을 3단계 이상 중첩할 수 없습니다.\n' +
        ' 복잡한 로직은 hooks 또는 유틸리티 함수로 분리하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isComponentFile(context, filename)) return {};

    // 제어문 중첩 깊이 추적
    let controlFlowDepth = 0;

    function enterControl(node) {
      controlFlowDepth++;
      if (controlFlowDepth >= 3) {
        context.report({ node, messageId: 'noDeepLogicInComponent' });
      }
    }

    function exitControl() {
      controlFlowDepth--;
    }

    // 함수 경계에서 깊이 초기화 (중첩 함수 독립 처리)
    const depthStack = [];

    function enterFunction() {
      depthStack.push(controlFlowDepth);
      controlFlowDepth = 0;
    }

    function exitFunction() {
      controlFlowDepth = depthStack.pop() ?? 0;
    }

    return {
      // 함수 경계
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      // 제어문 중첩 깊이
      IfStatement: enterControl,
      'IfStatement:exit': exitControl,
      ForStatement: enterControl,
      'ForStatement:exit': exitControl,
      ForInStatement: enterControl,
      'ForInStatement:exit': exitControl,
      ForOfStatement: enterControl,
      'ForOfStatement:exit': exitControl,
      WhileStatement: enterControl,
      'WhileStatement:exit': exitControl,
      DoWhileStatement: enterControl,
      'DoWhileStatement:exit': exitControl,
      SwitchStatement: enterControl,
      'SwitchStatement:exit': exitControl,
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────
module.exports = {
  rules: {
    'no-async-in-component': noAsyncInComponent,
    'no-data-transform-in-component': noDataTransformInComponent,
    'no-deep-logic-in-component': noDeepLogicInComponent,
  },
};
