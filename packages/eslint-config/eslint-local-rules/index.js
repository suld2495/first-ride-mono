const env = process.env.ESLINT_PROJECT_TYPE;
const useTanstackQuery = process.env.ESLINT_USE_TANSTACK_QUERY === 'true';

if (!env) {
  console.warn(
    '[eslint-local-rules] ESLINT_PROJECT_TYPE 환경변수가 설정되지 않았습니다.\n' +
      '가능한 값: rn | web | server | rn-web\n' +
      'package.json scripts 에 ESLINT_PROJECT_TYPE=rn 을 추가하세요.',
  );
}

module.exports = {
  // 모든 프로젝트 공통
  ...require('./javascript'),

  // TypeScript 사용 시
  ...require('./typescript'),

  // React 계열 공통 (RN 포함)
  ...require('./react'),

  // React Native 전용
  ...(env === 'rn' || env === 'rn-web' ? require('./react-native') : {}),

  // 웹 React 전용 (Next.js 등)
  ...(env === 'web' || env === 'rn-web' ? require('./web') : {}),

  // 서버 사이드 전용
  ...(env === 'server' ? require('./server') : {}),

  // Tamagui 사용 시
  ...require('./tamagui'),

  // i18n UI 규칙
  ...require('./i18n'),

  // TanStack Query 사용 시
  ...(useTanstackQuery ? require('./tanstack-query') : {}),
};
