/** @jest-environment node */

jest.mock('@tamagui/metro-plugin', () => ({
  withTamagui: (config: unknown) => config,
}));

type ResolveRequest = (
  context: {
    resolveRequest: ResolveRequest;
  },
  moduleName: string,
  platform: string,
) => {
  filePath: string;
  platform?: string;
  type: 'sourceFile';
};

const metroConfig = require('../../metro.config') as {
  resolver: {
    resolveRequest: ResolveRequest | null;
  };
};

describe('Metro web compatibility', () => {
  it('웹에서는 Zustand middleware의 CommonJS 엔트리를 해석한다', () => {
    const { resolveRequest } = metroConfig.resolver;

    expect(typeof resolveRequest).toBe('function');

    if (!resolveRequest) {
      throw new Error('Metro resolveRequest가 설정되지 않았습니다.');
    }

    const defaultResolveRequest = jest.fn((_context, moduleName, platform) => ({
      filePath: moduleName,
      platform,
      type: 'sourceFile' as const,
    }));
    const context = { resolveRequest: defaultResolveRequest };

    const webResolution = resolveRequest(context, 'zustand/middleware', 'web');
    const nativeResolution = resolveRequest(
      context,
      'zustand/middleware',
      'ios',
    );

    expect(webResolution.filePath).toMatch(/zustand\/middleware\.js$/);
    expect(nativeResolution.filePath).toBe('zustand/middleware');
  });
});
