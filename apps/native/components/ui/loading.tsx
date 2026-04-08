import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

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
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size}
        color={theme.colors.action.primary.default}
      />
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
