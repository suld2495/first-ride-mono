import axiosInstance from '@repo/shared/api';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@repo/shared/utils';
import MockAdapter from 'axios-mock-adapter';

import Index from '../../../app/(tabs)/(afterLogin)/(routine)/index';
import {
  describeAuthRedirect,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';
import { createMockRoutines } from '../../setup/routine/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
};

// axios mock adapter
let mockAxios: MockAdapter;

describe('루틴 조회 페이지', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    // 기본 API 응답 설정 (인증 테스트용)
    mockAxios.onGet(/\/routine\/list/).reply(200, { data: [] });
    // 인증 요청 목록 API 기본 응답
    mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 공통 인증 테스트
  describeAuthRedirect(() => render(<Index />));

  describe('루틴 존재 여부 테스트', () => {
    describe('루틴이 존재하지 않는 경우', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, { data: [] });
      });

      it('등록된 루틴이 없습니다 메시지가 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
      });
    });

    describe('루틴이 존재하는 경우', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(2) });
      });

      it('루틴 목록이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
        expect(await findByText('테스트 루틴 2')).toBeOnTheScreen();
      });

      it('루틴 리스트 타이틀이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('루틴 리스트')).toBeOnTheScreen();
      });

      it('루틴 추가 버튼이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('루틴 추가 +')).toBeOnTheScreen();
      });
    });
  });

  describe('루틴 달성횟수 UI 테스트 (number 타입)', () => {
    beforeEach(() => {
      mockRoutineStore.type = 'number';
    });

    describe('달성횟수가 목표보다 적은 경우', () => {
      const weeklyCount = 3; // 실제 달성 횟수
      const routineCount = 5; // 목표 횟수
      const expectedPercent = '60%'; // 3/5 = 60%

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('달성률 퍼센트가 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText(expectedPercent)).toBeOnTheScreen();
      });

      it('1회부터 7회까지 회차 라벨이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('1회')).toBeOnTheScreen();
        expect(await findByText('2회')).toBeOnTheScreen();
        expect(await findByText('3회')).toBeOnTheScreen();
        expect(await findByText('4회')).toBeOnTheScreen();
        expect(await findByText('5회')).toBeOnTheScreen();
        expect(await findByText('6회')).toBeOnTheScreen();
        expect(await findByText('7회')).toBeOnTheScreen();
      });

      it('달성한 횟수만큼 체크 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // weeklyCount(3)회 달성: 1회, 2회, 3회에 체크 아이콘
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();

        // weeklyCount+1 ~ routineCount(4회, 5회)는 미달성 (목표 내)
        expect(await findByLabelText('4회 미달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 미달성')).toBeOnTheScreen();

        // routineCount+1 ~ 7회(6회, 7회)는 목표 없음
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
      });
    });

    describe('달성횟수가 목표와 같은 경우', () => {
      const weeklyCount = 5; // 실제 달성 횟수
      const routineCount = 5; // 목표 횟수 (100% 달성)

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('체크마크 아이콘이 표시된다 (100% 달성)', async () => {
        const { findByText, findByLabelText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        // 100% 달성시 퍼센트 텍스트 대신 체크 아이콘 표시
        await waitFor(() => {
          expect(queryByText('100%')).not.toBeOnTheScreen();
        });

        // 목표 달성 완료 체크 아이콘이 표시되는지 확인
        expect(await findByLabelText('목표 달성 완료')).toBeOnTheScreen();
      });

      it('모든 목표에 체크 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // routineCount(5)회 모두 달성
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('4회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 달성')).toBeOnTheScreen();

        // routineCount+1 ~ 7회(6회, 7회)는 목표 없음
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
      });
    });

    describe('달성횟수가 목표를 초과한 경우', () => {
      const weeklyCount = 7; // 실제 달성 횟수 (초과 달성)
      const routineCount = 5; // 목표 횟수

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('목표 내 달성에는 체크 아이콘, 초과 달성에는 초과 달성 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // 목표 routineCount(5)회 내 달성
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('4회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 달성')).toBeOnTheScreen();

        // 초과 달성 (routineCount+1 ~ weeklyCount: 6회, 7회)
        expect(await findByLabelText('6회 초과 달성')).toBeOnTheScreen();
        expect(await findByLabelText('7회 초과 달성')).toBeOnTheScreen();
      });
    });

    describe('목표가 0인 경우', () => {
      const weeklyCount = 0; // 실제 달성 횟수
      const routineCount = 0; // 목표 횟수 (0 >= 0 이므로 100% 달성으로 취급)

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('체크마크 아이콘이 표시된다 (목표 0, 달성 0은 100% 달성으로 취급)', async () => {
        const { findByText, findByLabelText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        // weeklyCount >= routineCount (0 >= 0)이므로 퍼센트 대신 체크 아이콘 표시
        await waitFor(() => {
          expect(queryByText('0%')).not.toBeOnTheScreen();
        });

        // 목표 달성 완료 체크 아이콘이 표시되는지 확인
        expect(await findByLabelText('목표 달성 완료')).toBeOnTheScreen();
      });

      it('모든 회차가 목표 없음으로 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // 모든 7회차가 목표 없음
        expect(await findByLabelText('1회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('2회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('3회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('4회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('5회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
      });
    });
  });

  describe('루틴 달성횟수 UI 테스트 (week 타입)', () => {
    beforeEach(() => {
      mockRoutineStore.type = 'week';
    });

    describe('week 타입 표시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount: 3, routineCount: 5 }),
        });
      });

      it('요일 라벨이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('월')).toBeOnTheScreen();
        expect(await findByText('화')).toBeOnTheScreen();
        expect(await findByText('수')).toBeOnTheScreen();
        expect(await findByText('목')).toBeOnTheScreen();
        expect(await findByText('금')).toBeOnTheScreen();
        expect(await findByText('토')).toBeOnTheScreen();
        expect(await findByText('일')).toBeOnTheScreen();
      });
    });

    describe('요일별 달성 아이콘 표시', () => {
      it('달성한 요일에는 체크 아이콘, 미달성 요일에는 빈 네모 아이콘이 표시된다', async () => {
        // 현재 주의 월, 화, 수 날짜를 동적으로 생성
        const today = new Date();
        const monday = new Date(getWeekMonday(today));
        const createSuccessDate = (date: Date) => {
          const year = date.getFullYear() - 2000;
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate();

          return `${year}${month}${day}`;
        };

        const monDate = new Date(monday);
        const tueDate = new Date(monday);

        tueDate.setDate(tueDate.getDate() + 1);
        const wedDate = new Date(monday);

        wedDate.setDate(wedDate.getDate() + 2);

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 3,
            routineCount: 5,
            successDate: [
              createSuccessDate(monDate),
              createSuccessDate(tueDate),
              createSuccessDate(wedDate),
            ],
          }),
        });

        const { findByLabelText } = render(<Index />);

        // 달성한 요일 (월, 화, 수)
        expect(await findByLabelText('월요일 달성')).toBeOnTheScreen();
        expect(await findByLabelText('화요일 달성')).toBeOnTheScreen();
        expect(await findByLabelText('수요일 달성')).toBeOnTheScreen();

        // 미달성 요일 (목, 금, 토, 일)
        expect(await findByLabelText('목요일 미달성')).toBeOnTheScreen();
        expect(await findByLabelText('금요일 미달성')).toBeOnTheScreen();
        expect(await findByLabelText('토요일 미달성')).toBeOnTheScreen();
        expect(await findByLabelText('일요일 미달성')).toBeOnTheScreen();
      });
    });
  });

  describe('날짜 표시 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('현재 주의 시작일과 종료일이 실제 날짜로 표시된다', async () => {
      const { findByText } = render(<Index />);

      const today = new Date();
      const startDate = new Date(getWeekMonday(today));
      const endDate = new Date(getWeekSunday(startDate));

      // 실제 날짜 형식으로 표시되는지 확인 (예: "24년 11월 25일")
      expect(
        await findByText(getDisplayFormatDate(startDate)),
      ).toBeOnTheScreen();
      expect(await findByText(getDisplayFormatDate(endDate))).toBeOnTheScreen();
    });

    it('특정 날짜가 지정된 경우 해당 주의 날짜 범위가 표시된다', async () => {
      const specificDate = '2024-12-02'; // 특정 날짜 지정

      mockSearchParams.date = specificDate;

      const { findByText } = render(<Index />);

      const startDate = new Date(getWeekMonday(new Date(specificDate)));
      const endDate = new Date(getWeekSunday(startDate));

      expect(
        await findByText(getDisplayFormatDate(startDate)),
      ).toBeOnTheScreen();
      expect(await findByText(getDisplayFormatDate(endDate))).toBeOnTheScreen();
    });
  });

  describe('보기 방식 변경 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('number 타입에서 week 타입으로 변경할 수 있다', async () => {
      mockRoutineStore.type = 'number';
      const { findByText, findByLabelText } = render(<Index />);

      await findByText('테스트 루틴 1');

      // 요일별 보기 버튼 클릭 (week 타입으로 변경)
      const weekViewButton = await findByLabelText('요일별 보기');

      fireEvent.press(weekViewButton);

      expect(mockRoutineStore.setType).toHaveBeenCalledWith('week');
    });

    it('week 타입에서 number 타입으로 변경할 수 있다', async () => {
      mockRoutineStore.type = 'week';
      const { findByText, findByLabelText } = render(<Index />);

      await findByText('테스트 루틴 1');

      // 회차별 보기 버튼 클릭 (number 타입으로 변경)
      const numberViewButton = await findByLabelText('회차별 보기');

      fireEvent.press(numberViewButton);

      expect(mockRoutineStore.setType).toHaveBeenCalledWith('number');
    });

    it('number 타입일 때 회차 라벨이 표시된다', async () => {
      mockRoutineStore.type = 'number';
      const { findByText } = render(<Index />);

      expect(await findByText('1회')).toBeOnTheScreen();
    });
  });

  describe('주 이동 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('이전 주 버튼이 표시된다', async () => {
      const { findByLabelText } = render(<Index />);

      expect(await findByLabelText('이전 주')).toBeOnTheScreen();
    });

    it('다음 주 버튼이 표시된다', async () => {
      const { findByLabelText } = render(<Index />);

      expect(await findByLabelText('다음 주')).toBeOnTheScreen();
    });

    it('이전 주 버튼이 올바르게 렌더링된다', async () => {
      const { findByLabelText } = render(<Index />);

      const prevButton = await findByLabelText('이전 주');

      // Link 컴포넌트의 href 속성 확인
      // expo-router Link는 내부적으로 href를 처리하므로
      // 버튼이 올바르게 렌더링되는지 확인
      expect(prevButton).toBeOnTheScreen();
    });

    it('다음 주 버튼이 올바르게 렌더링된다', async () => {
      const { findByLabelText } = render(<Index />);

      const nextButton = await findByLabelText('다음 주');

      expect(nextButton).toBeOnTheScreen();
    });

    it('특정 주에서 이전 주로 이동하면 날짜가 변경된다', async () => {
      const specificDate = '2024-12-09'; // 월요일

      mockSearchParams.date = specificDate;

      const { findByText, findByLabelText, rerender } = render(<Index />);

      // 현재 주의 날짜 확인
      const startDate = new Date(getWeekMonday(new Date(specificDate)));

      expect(
        await findByText(getDisplayFormatDate(startDate)),
      ).toBeOnTheScreen();

      // 이전 주 버튼 확인
      const prevButton = await findByLabelText('이전 주');

      expect(prevButton).toBeOnTheScreen();

      // 이전 주 날짜 계산
      const previousMonday = beforeWeek(new Date(specificDate));
      const prevStartDate = new Date(getWeekMonday(new Date(previousMonday)));

      // 이전 주로 이동한 경우의 날짜 확인 (URL 변경 후 재렌더링 시뮬레이션)
      mockSearchParams.date = previousMonday;
      rerender(<Index />);

      expect(
        await findByText(getDisplayFormatDate(prevStartDate)),
      ).toBeOnTheScreen();
    });

    it('특정 주에서 다음 주로 이동하면 날짜가 변경된다', async () => {
      const specificDate = '2024-12-09'; // 월요일

      mockSearchParams.date = specificDate;

      const { findByText, findByLabelText, rerender } = render(<Index />);

      // 현재 주의 날짜 확인
      const startDate = new Date(getWeekMonday(new Date(specificDate)));

      expect(
        await findByText(getDisplayFormatDate(startDate)),
      ).toBeOnTheScreen();

      // 다음 주 버튼 확인
      const nextButton = await findByLabelText('다음 주');

      expect(nextButton).toBeOnTheScreen();

      // 다음 주 날짜 계산
      const nextMonday = afterWeek(new Date(specificDate));
      const nextStartDate = new Date(getWeekMonday(new Date(nextMonday)));

      // 다음 주로 이동한 경우의 날짜 확인 (URL 변경 후 재렌더링 시뮬레이션)
      mockSearchParams.date = nextMonday;
      rerender(<Index />);

      expect(
        await findByText(getDisplayFormatDate(nextStartDate)),
      ).toBeOnTheScreen();
    });
  });

  describe('인증 요청 버튼 테스트', () => {
    describe('현재 주인 경우', () => {
      beforeEach(() => {
        mockSearchParams.date = getWeekMonday(new Date());
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(1) });
      });

      it('인증 요청 버튼이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('인증 요청')).toBeOnTheScreen();
      });

      it('인증 요청 버튼을 클릭하면 요청 모달이 열린다', async () => {
        const { findByText } = render(<Index />);

        const requestButton = await findByText('인증 요청');

        fireEvent.press(requestButton);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/modal?type=request');
        });
      });
    });

    describe('과거 주인 경우', () => {
      beforeEach(() => {
        // 2주 전 날짜로 설정
        const pastDate = beforeWeek(new Date(getWeekMonday(new Date())));

        mockSearchParams.date = beforeWeek(new Date(pastDate));
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(1) });
      });

      it('인증 요청 버튼이 표시되지 않는다', async () => {
        const { findByText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        await waitFor(() => {
          expect(queryByText('인증 요청')).not.toBeOnTheScreen();
        });
      });
    });
  });

  describe('루틴 상세 모달 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('루틴 이름을 클릭하면 상세 모달이 열린다', async () => {
      const { findByText } = render(<Index />);

      const routineTitle = await findByText('테스트 루틴 1');

      fireEvent.press(routineTitle);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/modal?type=routine-detail');
      });
    });
  });

  describe('API 에러 테스트', () => {
    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(500, {
          error: { message: '서버 오류가 발생했습니다.' },
        });
      });

      it('빈 목록 메시지가 표시된다 (initialData가 빈 배열)', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).networkError();
      });

      it('빈 목록 메시지가 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
      });
    });
  });

  describe('메이트 인증 요청 카운트 테스트', () => {
    describe('인증 요청이 없는 경우', () => {
      it('벨 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        expect(await findByLabelText('인증 요청 알림')).toBeOnTheScreen();
      });
    });
  });
});
