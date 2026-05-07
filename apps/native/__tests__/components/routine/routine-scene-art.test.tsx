import {
  getRoutineSceneBackgroundAsset,
  getRoutineSceneCharacterAsset,
  getRoutineScenePreviewOverlayAsset,
  routineSceneBackgroundAssets,
  routineSceneCharacterAssets,
  routineScenePreviewOverlayAssets,
} from '@/components/routine/routine-scene-art';

describe('routine-scene-art', () => {
  it('테마 이름에 맞는 루틴 캐릭터 에셋을 반환한다', () => {
    expect(getRoutineSceneCharacterAsset('blue')).toBe(
      routineSceneCharacterAssets.blue,
    );
    expect(getRoutineSceneCharacterAsset('green')).toBe(
      routineSceneCharacterAssets.green,
    );
    expect(getRoutineSceneCharacterAsset('red')).toBe(
      routineSceneCharacterAssets.red,
    );
  });

  it('기본 테마는 블루 캐릭터를 사용한다', () => {
    expect(getRoutineSceneCharacterAsset('light')).toBe(
      routineSceneCharacterAssets.blue,
    );
    expect(getRoutineSceneCharacterAsset('dark')).toBe(
      routineSceneCharacterAssets.blue,
    );
  });

  it('테마 이름에 맞는 루틴 배경 에셋을 반환한다', () => {
    expect(getRoutineSceneBackgroundAsset('blue')).toBe(
      routineSceneBackgroundAssets.blue,
    );
    expect(getRoutineSceneBackgroundAsset('green')).toBe(
      routineSceneBackgroundAssets.green,
    );
    expect(getRoutineSceneBackgroundAsset('red')).toBe(
      routineSceneBackgroundAssets.red,
    );
  });

  it('기본 테마는 블루 배경을 사용한다', () => {
    expect(getRoutineSceneBackgroundAsset('light')).toBe(
      routineSceneBackgroundAssets.blue,
    );
    expect(getRoutineSceneBackgroundAsset('dark')).toBe(
      routineSceneBackgroundAssets.blue,
    );
  });

  it('테마 이름에 맞는 루틴 미리보기 오버레이 에셋을 반환한다', () => {
    expect(getRoutineScenePreviewOverlayAsset('blue')).toBe(
      routineScenePreviewOverlayAssets.blue,
    );
    expect(getRoutineScenePreviewOverlayAsset('green')).toBe(
      routineScenePreviewOverlayAssets.green,
    );
    expect(getRoutineScenePreviewOverlayAsset('red')).toBe(
      routineScenePreviewOverlayAssets.red,
    );
  });

  it('기본 테마는 블루 미리보기 오버레이를 사용한다', () => {
    expect(getRoutineScenePreviewOverlayAsset('light')).toBe(
      routineScenePreviewOverlayAssets.blue,
    );
    expect(getRoutineScenePreviewOverlayAsset('dark')).toBe(
      routineScenePreviewOverlayAssets.blue,
    );
  });
});
