export const statKey = {
  all: () => ['stat'] as const,
  me: () => [...statKey.all(), 'me'] as const,
};
