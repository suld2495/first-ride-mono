import {
  useDeleteFriendMutation,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { Friend, SearchOption } from '@repo/types';
import { IconTrash } from '@tabler/icons-react';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/error-utils';

import IconButton from '../common/button/IconButton';
import Paragraph from '../common/paragraph/Paragraph';
import ToastContainer from '../common/ToastContainer';

interface FriendItemProps extends Friend {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const FriendItem = ({ nickname, onSuccess, onError }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(nickname);
      onSuccess('삭제되었습니다.');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '친구 삭제에 실패했습니다. 다시 시도해주세요.',
      );

      onError(errorMessage);
    }
  };

  return (
    <div className="h-[50px] flex items-center justify-between border-b-[1px] border-b-black dark:border-b-white">
      <Paragraph>{nickname}</Paragraph>
      <IconButton
        size="small"
        variant="plain"
        icon={<IconTrash size={16} />}
        className="px-2"
        onClick={handleDelete}
      />
    </div>
  );
};

const FriendList = ({ page, keyword }: SearchOption) => {
  const { data: friends } = useFetchFriendsQuery({ page, keyword });
  const { toasts, success, error, removeToast } = useToast();

  return (
    <>
      {!!friends?.length && (
        <ul>
          {friends.map((friend) => (
            <FriendItem
              key={friend.nickname}
              {...friend}
              onSuccess={success}
              onError={error}
            />
          ))}
        </ul>
      )}

      {!friends?.length && (
        <Paragraph className="h-[100px] w-full flex items-center justify-center">
          친구를 추가해보세요.
        </Paragraph>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default FriendList;
