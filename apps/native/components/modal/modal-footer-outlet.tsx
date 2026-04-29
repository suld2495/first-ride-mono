import { useContext } from 'react';

import ModalFooterContext from '@/components/modal/modal-footer-context';
import ThemeView from '@/components/ui/theme-view';

const ModalFooterOutlet = () => {
  const context = useContext(ModalFooterContext);

  if (!context?.footer) {
    return null;
  }

  return (
    <ThemeView testID="modal-footer" transparent>
      {context.footer}
    </ThemeView>
  );
};

export default ModalFooterOutlet;
