import { useContext, useEffect, type ReactNode } from 'react';

import ModalFooterContext from '@/components/modal/modal-footer-context';
import ThemeView from '@/components/ui/theme-view';

interface ModalFooterProps {
  children: ReactNode;
}

const ModalFooter = ({ children }: ModalFooterProps) => {
  const context = useContext(ModalFooterContext);
  const setFooter = context?.setFooter;

  useEffect(() => {
    if (!setFooter) {
      return;
    }

    setFooter(children);

    return () => setFooter(null);
  }, [children, setFooter]);

  if (context) {
    return null;
  }

  return (
    <ThemeView testID="modal-footer" transparent>
      {children}
    </ThemeView>
  );
};

export default ModalFooter;
