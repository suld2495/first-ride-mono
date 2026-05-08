import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { fireEvent } from '@testing-library/react-native';

import Account from '../../app/account';
import { render } from '../setup/test-utils';

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
  useUpdateMottoMutation: jest.fn(),
}));

describe('Account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: '끝까지 간다',
        mottos: ['끝까지 간다'],
        role: 'USER',
      },
    });
  });

  it('목록의 한마디를 입력으로 전환하고 저장 요청을 보낸다', () => {
    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: '새 한마디',
        mottos: ['새 한마디'],
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByDisplayValue, getByLabelText } = render(<Account />);

    fireEvent.press(getByLabelText('끝까지 간다 수정'));
    fireEvent.changeText(getByDisplayValue('끝까지 간다'), '새 한마디');
    fireEvent.press(getByLabelText('한마디 저장'));

    expect(mutate).toHaveBeenCalledWith(
      { mottos: ['새 한마디'] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('목록의 두 번째 한마디만 수정한다', () => {
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: '끝까지 간다',
        mottos: ['끝까지 간다', '두 번째 한마디'],
        role: 'USER',
      },
    });

    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: _request.mottos[0] ?? null,
        mottos: _request.mottos,
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByDisplayValue, getByLabelText } = render(<Account />);

    fireEvent.press(getByLabelText('두 번째 한마디 수정'));
    fireEvent.changeText(getByDisplayValue('두 번째 한마디'), '수정된 한마디');
    fireEvent.press(getByLabelText('한마디 저장'));

    expect(mutate).toHaveBeenLastCalledWith(
      { mottos: ['끝까지 간다', '수정된 한마디'] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('한마디를 여러 개 추가하고 삭제한다', () => {
    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: _request.mottos[0] ?? null,
        mottos: _request.mottos,
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getAllByText, getByDisplayValue, getByLabelText, getByText } =
      render(<Account />);

    fireEvent.press(getByLabelText('한마디 추가'));
    fireEvent.changeText(getByDisplayValue(''), '두 번째 한마디');
    fireEvent.press(getByLabelText('한마디 저장'));

    expect(mutate).toHaveBeenLastCalledWith(
      { mottos: ['끝까지 간다', '두 번째 한마디'] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );

    expect(getAllByText('끝까지 간다').length).toBeGreaterThan(0);
    expect(getByText('두 번째 한마디')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('두 번째 한마디 삭제'));

    expect(mutate).toHaveBeenLastCalledWith(
      { mottos: ['끝까지 간다'] },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('한마디가 4개 이상이면 3개만 보여주고 더보기로 펼친다', () => {
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: '첫 번째 한마디',
        mottos: [
          '첫 번째 한마디',
          '두 번째 한마디',
          '세 번째 한마디',
          '네 번째 한마디',
        ],
        role: 'USER',
      },
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: jest.fn(),
    });

    const { getByLabelText, getByText, queryByText } = render(<Account />);

    expect(getByText('두 번째 한마디')).toBeOnTheScreen();
    expect(getByText('세 번째 한마디')).toBeOnTheScreen();
    expect(queryByText('네 번째 한마디')).toBeNull();

    fireEvent.press(getByLabelText('한마디 목록 더보기'));

    expect(getByText('네 번째 한마디')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('한마디 목록 접기'));

    expect(queryByText('네 번째 한마디')).toBeNull();
  });
});
