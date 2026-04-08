'use strict';

const TARGET_COMPONENTS = new Set(['FlatList', 'SectionList']);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'FlatList와 SectionList는 반드시 keyExtractor prop을 명시하세요.',
      recommended: false,
    },
    messages: {
      missingKeyExtractor: 'FlatList와 SectionList는 반드시 keyExtractor prop을 명시하세요.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const componentName =
          node.name.type === 'JSXIdentifier'
            ? node.name.name
            : node.name.type === 'JSXMemberExpression'
              ? node.name.property.name
              : null;

        if (!componentName || !TARGET_COMPONENTS.has(componentName)) {
          return;
        }

        const hasKeyExtractor = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'keyExtractor',
        );

        if (!hasKeyExtractor) {
          context.report({ node, messageId: 'missingKeyExtractor' });
        }
      },
    };
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ───────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rule = require('./require-flatlist-keyextractor');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('require-flatlist-keyextractor', rule, {
    valid: [
      // keyExtractor 있음
      `<FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <UserItem user={item} />}
      />`,

      `<SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Item item={item} />}
      />`,

      // FlatList가 아닌 컴포넌트
      `<ScrollView><View /></ScrollView>`,
    ],

    invalid: [
      {
        code: `<FlatList
          data={users}
          renderItem={({ item }) => <UserItem user={item} />}
        />`,
        errors: [{ messageId: 'missingKeyExtractor' }],
      },

      {
        code: `<SectionList
          sections={sections}
          renderItem={({ item }) => <Item />}
        />`,
        errors: [{ messageId: 'missingKeyExtractor' }],
      },
    ],
  });
*/
