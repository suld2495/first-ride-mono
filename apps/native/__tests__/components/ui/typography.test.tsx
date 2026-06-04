import { render } from '@testing-library/react-native';

import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { Typography } from '../../../components/ui/typography';
import { fontFamilies, tamaguiConfig } from '../../../theme';

describe('Typography', () => {
  it('Tamagui provider 안에서 텍스트를 렌더링한다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Typography variant="title" weight="semibold" color="primary">
          테스트 타이포그래피
        </Typography>
      </AppTamaguiProvider>,
    );

    expect(getByText('테스트 타이포그래피')).toBeOnTheScreen();
  });

  it('새 폰트 스케일 variant를 모두 렌더링한다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <>
          <Typography variant="caption3">caption3</Typography>
          <Typography variant="caption2">caption2</Typography>
          <Typography variant="caption1">caption1</Typography>
          <Typography variant="body3">body3</Typography>
          <Typography variant="body2">body2</Typography>
          <Typography variant="body1">body1</Typography>
          <Typography variant="subtitle2">subtitle2</Typography>
          <Typography variant="subtitle1" weight="semibold">
            subtitle1
          </Typography>
          <Typography variant="title" weight="semibold">
            title
          </Typography>
          <Typography variant="h3" weight="semibold">
            h3
          </Typography>
          <Typography variant="h2" weight="semibold">
            h2
          </Typography>
          <Typography variant="h1" weight="semibold">
            h1
          </Typography>
          <Typography variant="h0" weight="semibold">
            h0
          </Typography>
        </>
      </AppTamaguiProvider>,
    );

    expect(getByText('caption3')).toBeOnTheScreen();
    expect(getByText('caption2')).toBeOnTheScreen();
    expect(getByText('caption1')).toBeOnTheScreen();
    expect(getByText('body3')).toBeOnTheScreen();
    expect(getByText('body2')).toBeOnTheScreen();
    expect(getByText('body1')).toBeOnTheScreen();
    expect(getByText('subtitle2')).toBeOnTheScreen();
    expect(getByText('subtitle1')).toBeOnTheScreen();
    expect(getByText('title')).toBeOnTheScreen();
    expect(getByText('h3')).toBeOnTheScreen();
    expect(getByText('h2')).toBeOnTheScreen();
    expect(getByText('h1')).toBeOnTheScreen();
    expect(getByText('h0')).toBeOnTheScreen();
  });

  it('weight prop으로 폰트 굵기를 적용한다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Typography variant="body3" weight="semibold">
          굵은 본문
        </Typography>
      </AppTamaguiProvider>,
    );

    expect(getByText('굵은 본문').props.fontWeight).toBe('600');
  });

  it('공통 폰트 패밀리로 Pretendard weight face를 사용한다', () => {
    expect(tamaguiConfig.fonts.body.family).toBe(fontFamilies.regular);
    expect(tamaguiConfig.fonts.body.face).toEqual({
      400: { normal: fontFamilies.regular },
      500: { normal: fontFamilies.medium },
      600: { normal: fontFamilies.semibold },
      700: { normal: fontFamilies.bold },
    });
  });

  it('semantic color 대신 사용자 지정 색상을 직접 적용할 수 있다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Typography color="#ff9900">커스텀 컬러</Typography>
      </AppTamaguiProvider>,
    );

    expect(getByText('커스텀 컬러')).toHaveStyle({ color: '#ff9900' });
  });

  it('glow 옵션을 통해 텍스트 그림자 효과를 적용한다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Typography glow>글로우 텍스트</Typography>
      </AppTamaguiProvider>,
    );

    expect(getByText('글로우 텍스트')).toHaveStyle({
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    });
  });
});
