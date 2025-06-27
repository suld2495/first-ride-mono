import { IconRefresh } from '@tabler/icons-react';

const Spinner = () => {
  return (
    <div className="animate-spin text-[var(--gray-main-color)]">
      <IconRefresh stroke={2} size="40px" />
    </div>
  );
};

export default Spinner;
