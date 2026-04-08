export const requestKey = {
  all: () => ['request'] as const,
  received: () => [...requestKey.all(), 'received'] as const,
  sent: () => [...requestKey.all(), 'sent'] as const,
  receivedList: (nickname: string) =>
    [...requestKey.received(), nickname] as const,
  detail: (requestId: number) => [...requestKey.all(), requestId] as const,
};
