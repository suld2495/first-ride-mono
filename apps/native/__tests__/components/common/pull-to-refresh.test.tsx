import { act } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { PullToRefresh } from '../../../components/ui/pull-to-refresh';
import { render } from '../../setup/test-utils';

describe('PullToRefresh', () => {
  describe('렌더링', () => {
    it('자식 컴포넌트가 정상적으로 렌더링된다', () => {
      const { getByText } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      expect(getByText('Test Content')).toBeOnTheScreen();
    });

    it('onRefresh가 없을 때도 정상 렌더링된다', () => {
      const { getByText } = render(
        <PullToRefresh>
          <View>
            <Text>Content without refresh</Text>
          </View>
        </PullToRefresh>,
      );

      expect(getByText('Content without refresh')).toBeOnTheScreen();
    });

    it('scrollViewProps를 전달하면 ScrollView에 적용된다', () => {
      const { getByTestId } = render(
        <PullToRefresh scrollViewProps={{ testID: 'custom-scroll-view' }}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      expect(getByTestId('custom-scroll-view')).toBeOnTheScreen();
    });
  });

  describe('RefreshControl', () => {
    it('초기 상태에서 RefreshControl이 비활성화 상태다', () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);

      const { getByTestId } = render(
        <PullToRefresh onRefresh={mockRefresh}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      expect(scrollView.props.refreshControl).toBeTruthy();
      expect(scrollView.props.refreshControl.props.refreshing).toBe(false);
    });

    it('onRefresh가 없으면 RefreshControl이 렌더링되지 않는다', () => {
      const { getByTestId } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      expect(scrollView.props.refreshControl).toBeUndefined();
    });
  });

  describe('onRefresh 호출', () => {
    it('onRefresh prop이 RefreshControl에 전달되어 호출된다', () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);

      const { getByTestId } = render(
        <PullToRefresh onRefresh={mockRefresh}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      act(() => {
        scrollView.props.refreshControl.props.onRefresh();
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('onRefresh는 비동기 함수를 처리할 수 있다', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);

      const { getByTestId } = render(
        <PullToRefresh onRefresh={mockRefresh}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      await act(async () => {
        scrollView.props.refreshControl.props.onRefresh();
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      await expect(mockRefresh.mock.results[0].value).resolves.toBeUndefined();
    });
  });

  describe('ScrollView 속성', () => {
    it('contentContainerStyle이 flexGrow: 1로 설정된다', () => {
      const { getByTestId } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      expect(scrollView.props.contentContainerStyle).toEqual({ flexGrow: 1 });
    });

    it('showsVerticalScrollIndicator가 false로 설정된다', () => {
      const { getByTestId } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = getByTestId('pull-to-refresh-scroll-view');

      expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    });
  });

  describe('여러 자식 요소', () => {
    it('여러 개의 자식 요소를 렌더링할 수 있다', () => {
      const { getByText } = render(
        <PullToRefresh>
          <View>
            <Text>First Child</Text>
            <Text>Second Child</Text>
            <Text>Third Child</Text>
          </View>
        </PullToRefresh>,
      );

      expect(getByText('First Child')).toBeOnTheScreen();
      expect(getByText('Second Child')).toBeOnTheScreen();
      expect(getByText('Third Child')).toBeOnTheScreen();
    });
  });
});
