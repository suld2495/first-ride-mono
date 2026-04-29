import { useMemo, useState, type ReactNode } from 'react';

import ModalFooterContext from '@/components/modal/modal-footer-context';

interface ModalFooterProviderProps {
  children: ReactNode;
}

const ModalFooterProvider = ({ children }: ModalFooterProviderProps) => {
  const [footer, setFooter] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ footer, setFooter }), [footer]);

  return (
    <ModalFooterContext.Provider value={value}>
      {children}
    </ModalFooterContext.Provider>
  );
};

export default ModalFooterProvider;
