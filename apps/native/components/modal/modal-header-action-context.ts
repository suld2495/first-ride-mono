import { createContext, type ReactNode } from 'react';

interface ModalHeaderActionContextValue {
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
}

const ModalHeaderActionContext =
  createContext<ModalHeaderActionContextValue | null>(null);

export default ModalHeaderActionContext;
