import React from 'react';
import { Text, View } from 'react-native';

import { PullToRefresh } from '../../../components/common/PullToRefresh';
import { fireEvent, render } from '../../setup/test-utils';

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
    it('refreshing=true일 때 RefreshControl이 활성화 상태다', () => {
      const mockRefresh = jest.fn();

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh} refreshing={true}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      // ScrollView가 렌더링되었는지 확인
      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
      expect(scrollView).toBeTruthy();

      // refreshControl prop이 설정되어 있는지 확인
      expect(scrollView.props.refreshControl).toBeTruthy();
      expect(scrollView.props.refreshControl.props.refreshing).toBe(true);
    });

    it('refreshing=false일 때 RefreshControl이 비활성화 상태다', () => {
      const mockRefresh = jest.fn();

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh} refreshing={false}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
      expect(scrollView.props.refreshControl.props.refreshing).toBe(false);
    });

    it('refreshing prop이 없으면 기본값 false로 동작한다', () => {
      const mockRefresh = jest.fn();

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
      expect(scrollView.props.refreshControl.props.refreshing).toBe(false);
    });

    it('onRefresh가 없으면 RefreshControl이 렌더링되지 않는다', () => {
      const { UNSAFE_getByType } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
      expect(scrollView.props.refreshControl).toBeUndefined();
    });
  });

  describe('onRefresh 호출', () => {
    it('Pull 동작 시 onRefresh가 호출된다', () => {
      const mockRefresh = jest.fn();

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh} refreshing={false}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );

      // RefreshControl의 onRefresh 직접 호출
      scrollView.props.refreshControl.props.onRefresh();

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('onRefresh는 동기 함수도 처리할 수 있다', () => {
      let callCount = 0;
      const mockRefresh = () => {
        callCount++;
      };

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh} refreshing={false}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );

      // RefreshControl의 onRefresh 직접 호출
      scrollView.props.refreshControl.props.onRefresh();

      expect(callCount).toBe(1);
    });

    it('onRefresh는 비동기 함수도 처리할 수 있다', async () => {
      const mockRefresh = jest.fn().mockResolvedValue(undefined);

      const { UNSAFE_getByType } = render(
        <PullToRefresh onRefresh={mockRefresh} refreshing={false}>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );

      // RefreshControl의 onRefresh 직접 호출
      scrollView.props.refreshControl.props.onRefresh();

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      await expect(mockRefresh.mock.results[0].value).resolves.toBeUndefined();
    });
  });

  describe('ScrollView 속성', () => {
    it('contentContainerStyle이 flexGrow: 1로 설정된다', () => {
      const { UNSAFE_getByType } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
      expect(scrollView.props.contentContainerStyle).toEqual({ flexGrow: 1 });
    });

    it('showsVerticalScrollIndicator가 false로 설정된다', () => {
      const { UNSAFE_getByType } = render(
        <PullToRefresh>
          <Text>Test Content</Text>
        </PullToRefresh>,
      );

      const scrollView = UNSAFE_getByType(
        require('react-native').ScrollView,
      );
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
