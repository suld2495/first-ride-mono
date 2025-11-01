import { RequestList } from '@repo/types';

import DarkMode from '@/components/common/DarkMode';
import NotificationBell from '@/components/common/notification-bell/NotificationBell';
import Paragraph from '@/components/common/paragraph/Paragraph';
import { ModalName, useModalStore } from '@/store/modal.store';
import { useRequestStore } from '@repo/shared/store/request.store';
import Header from '../common/Header';
import { getFormatDate } from '@repo/shared/utils';

interface RoutineHeaderProps {
  list: RequestList;
  nickname: string;
}

const NotificationContent = ({
  mateNickname, 
  createdAt, 
  routineName,
}: { id: number; mateNickname: string; createdAt: string; routineName: string; }) => {
  return (
    <div
      className={`flex flex-col hover:bg-gray-100 dark:hover:bg-dark-primary-color-hover rounded-sm cursor-pointer`}
    >
      <Paragraph className="text-gray-600 font-semibold">
        {routineName}
      </Paragraph>
      <div className="flex justify-between items-center mt-1 text-[12px] text-gray-500 dark:text-gray-300">
        <span>{mateNickname}</span>
        <span>{getFormatDate(new Date(createdAt))}</span>
      </div>
    </div>
  )
};

const RoutineHeader = ({ list, nickname }: RoutineHeaderProps) => {
  const showModal = useModalStore((state) => state.show);
  const setRequestId = useRequestStore((state) => state.setRequestId);
  
  const handleModalShow = ({ id }: { id: number }) => {
    showModal(ModalName.REQUEST_DETAIL);
    setRequestId(id);
  };

  return (
    <Header>
      <div className="text-[15px] text-gray-500">
        <Paragraph className="text-[16px]">{nickname}</Paragraph>
      </div>
      <div className="flex gap-3 items-center">
        <NotificationBell
          list={list.map((item) => ({
            ...item,
            title: item.routineName,
          }))} 
          onClick={handleModalShow} 
          renderItem={(item) => (
            <NotificationContent 
              {...item}
            />
          )}
        />
        <DarkMode />
      </div>
    </Header>
  );
};

export default RoutineHeader;
