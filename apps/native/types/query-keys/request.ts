export const requestKey = {
  request: ['request'],
  received: () => [...requestKey.request, 'received'],
  sent: () => [...requestKey.request, 'sent'],
  receivedList: (nickname: string) => [...requestKey.received(), nickname],
  detail: (requestId: number) => [...requestKey.request, requestId],
};
