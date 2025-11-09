import { useState } from 'react';
import { useAddFriendMutation } from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import { SearchOption, User } from '@repo/types';
import { IconPlus } from '@tabler/icons-react';

import { useToast } from '@/hooks/useToast';
import { useModalStore } from '@/store/modal.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import IconButton from '../common/button/IconButton';
import Input from '../common/input/Input';
import Paragraph from '../common/paragraph/Paragraph';
import ToastContainer from '../common/ToastContainer';

interface UserItemProps extends User {
  close: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const UserItem = ({ nickname, close, onSuccess, onError }: UserItemProps) => {
  const addMutation = useAddFriendMutation();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync(nickname);
      onSuccess('추가되었습니다.');
      close();
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '친구 추가에 실패했습니다. 다시 시도해주세요.',
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
        icon={<IconPlus size={16} />}
        className="px-2"
        onClick={handleAdd}
      />
    </div>
  );
};

const FriendAddModal = () => {
  const closeModal = useModalStore((state) => state.close);
  const [keyword, setKeyword] = useState('');
  const [searchOption, setSearchOption] = useState<SearchOption>({
    page: 1,
    keyword: '',
  });
  const { toasts, success, error, removeToast } = useToast();

  const { data: userList } = useFetchUserListQuery(searchOption);

  const handleSerach = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }

    setSearchOption((option) => ({
      ...option,
      keyword,
    }));
  };

  return (
    <div>
      <Input
        className="w-full mt-3"
        placeholder="유저이름을 입력해주세요."
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onKeyDown={handleSerach}
      />
      <div>
        {!!userList?.length && (
          <ul>
            {userList.map((user) => (
              <UserItem
                key={user.userId}
                close={closeModal}
                onSuccess={success}
                onError={error}
                {...user}
              />
            ))}
          </ul>
        )}

        {!userList?.length && (
          <Paragraph className="h-[100px] w-full flex items-center justify-center">
            유저가 존재하지 않습니다.
          </Paragraph>
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default FriendAddModal;
