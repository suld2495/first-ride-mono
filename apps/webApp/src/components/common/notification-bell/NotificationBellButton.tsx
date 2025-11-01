import { IconBellPlus } from "@tabler/icons-react";

interface NotificationBellButtonProps {
  count: number;
  onClick: (e: React.MouseEvent) => void;
}

const NotificationBellButton = ({ count, onClick }: NotificationBellButtonProps) => {
  return (
    <div
      className="relative text-primary-color dark:text-white cursor-pointer flex "
      onClick={onClick}
    >
      <IconBellPlus stroke={2} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-[15px] h-[15px] leading-3 text-center rounded-full bg-red-400 text-[10px] text-white">
          {count}
        </span>
      )}
    </div>
  )
};

export default NotificationBellButton;