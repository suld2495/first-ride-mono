import { useModalStore } from '@/store/modal.store';

import Paragraph from './paragraph/Paragraph';

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

const Modal = ({ title, children }: ModalProps) => {
  const close = useModalStore((state) => state.close);

  return (
    <div className="fixed w-full h-dvh top-0 left-0 flex items-center justify-center px-5 z-10">
      <div
        className="absolute w-full h-full bg-gray-950 opacity-50"
        onClick={close}
      />
      <div className="relative z-1 p-6 bg-white dark:bg-dark-primary-color rounded-xl max-w-[var(--max-width)] w-full">
        <Paragraph
          className="pb-5 border-b-[1px] border-b-gray-300"
          variant="h3"
        >
          {title}
        </Paragraph>
        {children}
      </div>
    </div>
  );
};

export default Modal;
