import { useMemo, useState, type ReactNode } from 'react';

import ModalHeaderActionContext from '@/components/modal/modal-header-action-context';

interface ModalHeaderActionProviderProps {
  children: ReactNode;
}

const ModalHeaderActionProvider = ({
  children,
}: ModalHeaderActionProviderProps) => {
  const [action, setAction] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ action, setAction }), [action]);

  return (
    <ModalHeaderActionContext.Provider value={value}>
      {children}
    </ModalHeaderActionContext.Provider>
  );
};

export default ModalHeaderActionProvider;
