import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import { useRequestStore } from '@repo/shared/store/request.store';

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
