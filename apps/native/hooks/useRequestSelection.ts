import { useRequestStore } from '@/store/request.store';

export const useSelectedRequestId = () =>
  useRequestStore((state) => state.requestId);

export const useRequestId = useSelectedRequestId;

export const useSelectRequest = () =>
  useRequestStore((state) => state.setRequestId);

export const useSetRequestId = useSelectRequest;
