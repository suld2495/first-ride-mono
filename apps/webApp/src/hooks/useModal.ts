import { useEffect, useState } from "react";

export const useShowModal = (visible: boolean = false, modalSelectors: string = '.alert') => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (target.matches(modalSelectors) || target.closest(modalSelectors)) return;

      setShow(false);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [show, setShow]);

  return [show, setShow] as const;
};