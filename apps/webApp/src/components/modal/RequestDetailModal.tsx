import { useFetchRequestDetailQuery } from '@/hooks/useRequest';
import { useRequestStore } from '@/store/request.store';

import RequestView from '../request/RequestView';

const RequestDetailModal = () => {
  const requestId = useRequestStore((state) => state.requestId);
  const { data: detail, isLoading } = useFetchRequestDetailQuery(requestId);

  if (isLoading || !detail) {
    return null;
  }

  return <RequestView {...detail} />;
};

export default RequestDetailModal;
