export const notificationBadgeKeys = {
  all: () => ['notification-badge'] as const,
  pendingConfirmationCount: (userScope: string) =>
    [
      ...notificationBadgeKeys.all(),
      userScope,
      'pending-confirmation-count',
    ] as const,
};
