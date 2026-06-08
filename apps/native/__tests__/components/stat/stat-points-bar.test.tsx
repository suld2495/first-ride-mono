import StatPointsBar from '@/components/stat/stat-points-bar';

import { fireEvent, render } from '../../setup/test-utils';

describe('StatPointsBar', () => {
  it('스탯 분배 진입 버튼을 아이콘 버튼으로 표시한다', () => {
    const onEdit = jest.fn();

    const { getByLabelText, queryByText } = render(
      <StatPointsBar
        availablePoints={3}
        usedPoints={0}
        isEditing={false}
        onEdit={onEdit}
        onConfirm={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    fireEvent.press(getByLabelText('스탯 분배하기'));

    expect(queryByText('Edit')).toBeNull();
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
