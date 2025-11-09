import { useShowModal } from '@/hooks/useModal';

import NotificationBellButton from './NotificationBellButton';
import NotificationList from './NotificationList';

export interface Notification {
  title: string;
  createdAt?: string | Date;
}

interface NotificationBellProps<T extends Notification> {
  list: T[];
  onClick?: (item: T, index: number, e: React.MouseEvent) => void;
  renderItem: (item: T) => React.ReactNode;
}

const NotificationBell = <T extends Notification>({
  list,
  onClick,
  renderItem,
}: NotificationBellProps<T>) => {
  const [visible, setVisible] = useShowModal(false);

  return (
    <>
      <NotificationBellButton
        count={list.length}
        onClick={(e) => {
          setVisible(true);
          e.stopPropagation();
        }}
      />
      {visible && !!list.length && (
        <NotificationList
          list={list}
          renderItem={(item) => renderItem(item)}
          onClick={(item, index, e) => {
            setVisible(false);
            onClick?.(item, index, e);
          }}
        />
      )}
    </>
  );
};

export default NotificationBell;
