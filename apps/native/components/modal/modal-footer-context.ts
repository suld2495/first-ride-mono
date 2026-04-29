import { createContext, type ReactNode } from 'react';

interface ModalFooterContextValue {
  footer: ReactNode | null;
  setFooter: (footer: ReactNode | null) => void;
}

const ModalFooterContext = createContext<ModalFooterContextValue | null>(null);

export default ModalFooterContext;
