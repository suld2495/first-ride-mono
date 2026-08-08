import React from 'react';
import { View } from 'react-native';

import LoadingSpinner from '@/components/ui/loading-spinner';
import { StyleSheet } from '@/components/ui/tamagui';

export interface LoadingProps {
  /**
   * 로딩 인디케이터 크기
   * @default 'large'
   */
  size?: 'small' | 'large';
}

/**
 * 전체 화면 로딩 컴포넌트
 *
 * @example
 * if (isLoading) {
 *   return <Loading />;
 * }
 */
export const Loading: React.FC<LoadingProps> = ({ size = 'large' }) => {
  return (
    <View style={styles.container}>
      <LoadingSpinner size={size === 'small' ? 18 : 24} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
