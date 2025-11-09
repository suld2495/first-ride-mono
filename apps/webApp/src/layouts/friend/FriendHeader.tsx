import { useState } from 'react';
import {
  useAcceptFriendRequestMutation,
  useFetchFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { getFormatDate } from '@repo/shared/utils';
import { FriendRequest } from '@repo/types';

import Button from '@/components/common/button/Button';
import DarkMode from '@/components/common/DarkMode';
import NotificationBell from '@/components/common/notification-bell/NotificationBell';
import Paragraph from '@/components/common/paragraph/Paragraph';

import Header from '../common/Header';

const NotificationContent = ({
  id,
  senderNickname,
  createdAt,
  onAccept,
  onReject,
}: FriendRequest & {
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) => {
  return (
    <div className={`flex flex-col`}>
      <div className="flex justify-between">
        <Paragraph className="text-gray-600 font-semibold">
          {senderNickname}
        </Paragraph>
        <div className="flex gap-2">
          <Button
            size="very-small"
            className="px-2 dark:bg-blue-400 dark:hover:bg-blue-500"
            onClick={() => onAccept(id)}
          >
            추가
          </Button>
          <Button
            size="very-small"
            className="px-2 dark:bg-red-500 dark:hover:bg-red-600"
            onClick={() => onReject(id)}
          >
            거절
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1 text-[12px] text-gray-500 dark:text-gray-300">
        <span>{getFormatDate(createdAt)}</span>
      </div>
    </div>
  );
};

const FriendHeader = () => {
  const [page] = useState(1);
  const { data: list } = useFetchFriendRequestsQuery(page);
  const acceptFriendMutation = useAcceptFriendRequestMutation();
  const rejectFriendRequestMutation = useRejectFriendRequestMutation();

  const handleAccpet = async (id: number) => {
    try {
      await acceptFriendMutation.mutateAsync(id);
      alert('추가 되었습니다.');
    } catch {}
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequestMutation.mutateAsync(id);
      alert('거절 되었습니다.');
    } catch {}
  };

  if (!list) {
    return null;
  }

  return (
    <Header>
      <Paragraph variant="h3">친구 리스트</Paragraph>
      <div className="flex gap-3 items-center">
        <NotificationBell
          list={list.map((item) => ({
            ...item,
            title: item.senderNickname,
          }))}
          renderItem={(item) => (
            <NotificationContent
              onAccept={handleAccpet}
              onReject={handleReject}
              {...item}
            />
          )}
        />
        <DarkMode />
      </div>
    </Header>
  );
};

export default FriendHeader;
