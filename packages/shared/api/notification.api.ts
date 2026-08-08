import http from './client';

interface PendingConfirmationCountResponse {
  pendingConfirmationCount: number;
}

export const fetchPendingConfirmationCount = async (): Promise<number> => {
  const response = await http.get<PendingConfirmationCountResponse, void>(
    '/notifications/pending-confirmation-count',
  );

  return response.pendingConfirmationCount;
};
