import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, type ScrollViewProps } from 'react-native';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  minimumRefreshTime?: number;
  scrollViewProps?: Omit<ScrollViewProps, 'refreshControl' | 'children'>;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  minimumRefreshTime = 1000,
  scrollViewProps,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const handleRefresh = useCallback(() => {
    if (!onRefresh || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setRefreshing(true);

    const startTime = Date.now();

    onRefresh()
      .catch(() => {})
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingTime = minimumRefreshTime - elapsed;

        if (remainingTime > 0) {
          setTimeout(() => {
            setRefreshing(false);
            isRefreshingRef.current = false;
          }, remainingTime);
        } else {
          setRefreshing(false);
          isRefreshingRef.current = false;
        }
      });
  }, [onRefresh, minimumRefreshTime]);

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  ) : undefined;

  return (
    <ScrollView
      testID="pull-to-refresh-scroll-view"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};
