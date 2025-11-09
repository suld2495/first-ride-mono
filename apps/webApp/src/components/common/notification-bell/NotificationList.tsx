import { Notification } from './NotificationBell';

interface NotificationListProps<T extends Notification> {
  list: T[];
  renderItem: (item: T) => React.ReactNode;
  onClick: (item: T, index: number, e: React.MouseEvent) => void;
}

const NotificationList = <T extends Notification>({
  list,
  renderItem,
  onClick,
}: NotificationListProps<T>) => {
  return (
    <div className="absolute z-10 top-12 right-11">
      <div className="fixed z-1 w-full h-full top-0 left-0"></div>
      <ul className="notification-bell relative z-2 w-[200px] p-2 border-[1px] border-gray-300 rounded-sm bg-white dark:bg-primary-color shadow-lg dark:shadow-middle dark:shadow-gray-600/80">
        {list.map((item, index) => (
          <li key={index}>
            <div
              className={`flex flex-col p-2 border-b-[1px] border-gray-200 hover:bg-gray-100 dark:hover:bg-dark-primary-color-hover rounded-sm cursor-pointer`}
              onClick={(e) => onClick(item, index, e)}
            >
              {renderItem(item)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
