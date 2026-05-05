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
        role: 'USER',
      },
    });
  });

  it('좌우명을 입력으로 전환하고 저장 요청을 보낸다', () => {
    const mutate = jest.fn((_request, options) => {
      options?.onSuccess?.({
        userId: 'test123',
        nickname: 'testuser',
        motto: '새 좌우명',
        role: 'USER',
      });
    });

    (useUpdateMottoMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate,
    });

    const { getByDisplayValue, getByLabelText } = render(<Account />);

    fireEvent.press(getByLabelText('좌우명 수정'));
    fireEvent.changeText(getByDisplayValue('끝까지 간다'), '새 좌우명');
    fireEvent.press(getByLabelText('좌우명 저장'));

    expect(mutate).toHaveBeenCalledWith(
      { motto: '새 좌우명' },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
  });
});
