import { useContext, useEffect, type ReactNode } from 'react';

import ModalHeaderActionContext from '@/components/modal/modal-header-action-context';

interface ModalHeaderActionProps {
  children: ReactNode;
}

const ModalHeaderAction = ({ children }: ModalHeaderActionProps) => {
  const context = useContext(ModalHeaderActionContext);
  const setAction = context?.setAction;

  useEffect(() => {
    if (!setAction) {
      return;
    }

    setAction(children);

    return () => setAction(null);
  }, [children, setAction]);

  return null;
};

export default ModalHeaderAction;
