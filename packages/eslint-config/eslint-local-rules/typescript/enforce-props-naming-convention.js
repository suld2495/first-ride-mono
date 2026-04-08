'use strict';

const BOOLEAN_PREFIXES = ['is', 'has', 'can', 'should'];
const REACT_NODE_TYPES = new Set(['ReactNode', 'ReactElement', 'ReactChild', 'ReactPortal']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '컴포넌트 props 네이밍 컨벤션을 강제합니다.',
      recommended: false,
    },
    messages: {
      handlerNaming: '함수 타입 props는 on* 으로 시작해야 합니다. (예: onPress)',
      booleanNaming: 'boolean 타입 props는 is*, has*, can*, should* 로 시작해야 합니다. (예: isLoading)',
      renderNaming: 'ReactNode를 반환하는 props는 render* 로 시작해야 합니다. (예: renderItem)',
    },
    schema: [],
  },

  create(context) {
    function isReactNodeType(typeNode) {
      if (!typeNode) return false;

      if (typeNode.type === 'TSTypeReference') {
        const { typeName } = typeNode;
        if (typeName.type === 'Identifier') {
          return REACT_NODE_TYPES.has(typeName.name);
        }
        if (typeName.type === 'TSQualifiedName') {
          const left = typeName.left.name;
          const right = typeName.right.name;
          return (
            (left === 'React' && REACT_NODE_TYPES.has(right)) ||
            (left === 'JSX' && right === 'Element')
          );
        }
      }

      // JSX.Element 등 union 타입 중 하나라도 ReactNode이면 render*
      if (typeNode.type === 'TSUnionType') {
        return typeNode.types.some(isReactNodeType);
      }

      return false;
    }

    function getPropName(keyNode) {
      if (keyNode.type === 'Identifier') return keyNode.name;
      if (keyNode.type === 'Literal') return String(keyNode.value);
      return null;
    }

    function checkProperty(propNode) {
      const name = getPropName(propNode.key);
      if (!name) return;

      // optional prop (?:) 포함 모두 체크
      const typeAnnotation = propNode.typeAnnotation && propNode.typeAnnotation.typeAnnotation;
      if (!typeAnnotation) return;

      if (typeAnnotation.type === 'TSBooleanKeyword') {
        const valid = BOOLEAN_PREFIXES.some((prefix) => {
          const pattern = new RegExp(`^${prefix}[A-Z_]`);
          return pattern.test(name);
        });
        if (!valid) {
          context.report({ node: propNode, messageId: 'booleanNaming' });
        }
        return;
      }

      if (typeAnnotation.type === 'TSFunctionType') {
        const returnTypeAnnotation =
          typeAnnotation.returnType && typeAnnotation.returnType.typeAnnotation;

        if (isReactNodeType(returnTypeAnnotation)) {
          if (!/^render[A-Z_]/.test(name)) {
            context.report({ node: propNode, messageId: 'renderNaming' });
          }
        } else {
          if (!/^on[A-Z_]/.test(name)) {
            context.report({ node: propNode, messageId: 'handlerNaming' });
          }
        }
        return;
      }
    }

    function isPropsTypeName(name) {
      return name === 'Props' || name.endsWith('Props');
    }

    function checkMembers(members) {
      for (const member of members) {
        if (member.type === 'TSPropertySignature') {
          checkProperty(member);
        }
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        if (!isPropsTypeName(node.id.name)) return;
        if (node.typeAnnotation.type === 'TSTypeLiteral') {
          checkMembers(node.typeAnnotation.members);
        }
      },

      TSInterfaceDeclaration(node) {
        if (!isPropsTypeName(node.id.name)) return;
        checkMembers(node.body.body);
      },
    };
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ───────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rule = require('./enforce-props-naming-convention');
  const typescriptParser = require('@typescript-eslint/parser');

  const tester = new RuleTester({
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('enforce-props-naming-convention', rule, {
    valid: [
      // 올바른 네이밍
      `type Props = {
        onPress: () => void;
        isLoading: boolean;
        renderItem: () => ReactNode;
      }`,

      `interface ButtonProps {
        onChange: (value: string) => void;
        hasError: boolean;
        canSubmit: boolean;
      }`,

      // Props가 아닌 타입명은 무시
      `type Config = {
        loading: boolean;
        pressHandler: () => void;
      }`,
    ],

    invalid: [
      {
        code: `type Props = { pressHandler: () => void; }`,
        errors: [{ messageId: 'handlerNaming' }],
      },
      {
        code: `type Props = { loading: boolean; }`,
        errors: [{ messageId: 'booleanNaming' }],
      },
      {
        code: `type Props = { itemRenderer: () => ReactNode; }`,
        errors: [{ messageId: 'renderNaming' }],
      },
    ],
  });
*/
