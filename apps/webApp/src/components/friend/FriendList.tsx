import { useDeleteFriendMutation, useFetchFriendsQuery } from '@repo/shared/hooks/useFriend';
import { Friend, SearchOption } from '@repo/types';
import Paragraph from '../common/paragraph/Paragraph';
import { IconTrash } from '@tabler/icons-react';
import IconButton from '../common/button/IconButton';

const FriendItem = ({ nickname }: Friend) => {
  const deleteMutation = useDeleteFriendMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(nickname);
      alert('삭제되었습니다.');
    } catch {}
  };

  return (
    <div className='h-[50px] flex items-center justify-between border-b-[1px] border-b-black dark:border-b-white'>
      <Paragraph>{nickname}</Paragraph>
      <IconButton 
        size='small' 
        variant='plain' 
        icon={<IconTrash size={16} />}
        className='px-2'
        onClick={handleDelete}
      />
    </div>
  )
};

const FriendList = ({ page, keyword }: SearchOption) => {
  const { data: friends } = useFetchFriendsQuery({ page, keyword });

  return (
    <>
      {!!friends?.length && (
        <ul>
          {friends.map((friend) => (
            <FriendItem key={friend.nickname} {...friend} />
          ))}
        </ul>
      )}

      {!friends?.length && (
        <Paragraph 
          className='h-[100px] w-full flex items-center justify-center'
        >
          친구를 추가해보세요.
        </Paragraph>
      )}
    </>
  )
};

export default FriendList;