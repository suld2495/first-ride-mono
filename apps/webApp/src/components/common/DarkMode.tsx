import { useEffect } from 'react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useShallow } from 'zustand/shallow';

import { useDarkModeStore } from '@/store/dark.store';

const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useDarkModeStore(
    useShallow((state) => [state.isDarkMode, state.toggleDarkMode]),
  );

  const handleClick = () => {
    setIsDarkMode();
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div
      className="cursor-pointer text-primary-color dark:text-white"
      onClick={handleClick}
    >
      {isDarkMode ? <IconSun stroke={2} /> : <IconMoon stroke={2} />}
    </div>
  );
};

export default DarkMode;
