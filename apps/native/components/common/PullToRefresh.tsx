import React from 'react';
import { RefreshControl, ScrollView, type ScrollViewProps } from 'react-native';

export interface PullToRefreshProps {
  /**
   * Child elements to render
   */
  children: React.ReactNode;

  /**
   * Callback function triggered when user pulls down
   */
  onRefresh?: () => void;

  /**
   * Whether the refresh indicator is currently visible
   * @default false
   */
  refreshing?: boolean;

  /**
   * Optional ScrollView props to customize scroll behavior
   */
  scrollViewProps?: Omit<ScrollViewProps, 'refreshControl' | 'children'>;
}

/**
 * PullToRefresh component - A container that enables pull-to-refresh functionality
 *
 * This component wraps children in a ScrollView with RefreshControl,
 * allowing users to pull down to trigger a refresh action.
 *
 * @example
 * // Basic usage
 * <PullToRefresh onRefresh={handleRefresh} refreshing={isRefreshing}>
 *   <MyContent />
 * </PullToRefresh>
 *
 * @example
 * // Without refresh functionality (just scrollable)
 * <PullToRefresh>
 *   <MyContent />
 * </PullToRefresh>
 */
export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  scrollViewProps,
}) => {
  // If no onRefresh provided, don't enable pull-to-refresh
  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ) : undefined;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};
