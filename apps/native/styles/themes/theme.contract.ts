/**
 * Theme Contract
 * 모든 스킨이 반드시 구현해야 하는 공통 인터페이스
 */

export type ThemeDensity = 'compact' | 'comfortable' | 'spacious';
export type ThemeRadiusStyle = 'sharp' | 'rounded' | 'pill';

export type ThemeContract = {
  name: string;

  /**
   * UI 밀도 (spacing 전체에 영향을 주는 스킨 설정)
   * - compact   : 더 조밀한 인터페이스
   * - comfortable: 기본값
   * - spacious  : 여백이 더 넓은 인터페이스
   */
  density?: ThemeDensity;

  /**
   * 모서리 스타일
   * - sharp   : 각진 스타일 (0에 가깝게)
   * - rounded : 기본 둥근 모서리
   * - pill    : pill 형태에 가까운 모서리
   */
  radiusStyle?: ThemeRadiusStyle;

  /**
   * 타이포그래피 스킨 설정
   * - fontFamily: 스킨별 폰트 패밀리
   * - scale    : 전체 폰트 크기 배율 (ex: 0.95, 1.0, 1.1)
   */
  typography?: {
    fontFamily?: {
      regular: string;
      medium?: string;
      bold?: string;
    };
    scale?: number;
  };

  colors: {
    // Background (Layer)
    background: {
      base: string; // 전체 화면 배경
      surface: string; // 카드, 리스트 아이템 배경
      elevated: string; // 모달, 드롭다운 배경
      sunken: string; // 입력창 내부
      overlay: string; // 딤드 처리
    };

    // Text (Hierarchy)
    text: {
      primary: string; // 제목, 본문
      secondary: string; // 부가 설명
      tertiary: string; // 비활성, placeholder
      disabled: string; // 비활성 상태 텍스트
      inverse: string; // 어두운 배경 위 텍스트
      link: string; // 링크
    };

    // Action (Interactive)
    action: {
      primary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      secondary: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
      ghost: {
        default: string;
        pressed: string;
        disabled: string;
        label: string;
      };
    };

    // Feedback (Status)
    feedback: {
      success: { bg: string; text: string; border: string };
      error: { bg: string; text: string; border: string };
      warning: { bg: string; text: string; border: string };
      info: { bg: string; text: string; border: string };
    };

    // Border
    border: {
      default: string;
      strong: string;
      subtle: string;
      focus: string;
      divider: string; // 구분선
    };
  };
};
