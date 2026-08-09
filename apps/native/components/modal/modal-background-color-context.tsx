import { createContext, type ReactNode, useContext } from 'react';

type SetModalBackgroundColor = (color: string | undefined) => void;

const ModalBackgroundColorContext =
  createContext<SetModalBackgroundColor | null>(null);

interface ModalBackgroundColorProviderProps {
  children: ReactNode;
  onBackgroundColorChange: SetModalBackgroundColor;
}

export const ModalBackgroundColorProvider = ({
  children,
  onBackgroundColorChange,
}: ModalBackgroundColorProviderProps) => (
  <ModalBackgroundColorContext.Provider value={onBackgroundColorChange}>
    {children}
  </ModalBackgroundColorContext.Provider>
);

export const useSetModalBackgroundColor = () =>
  useContext(ModalBackgroundColorContext);
