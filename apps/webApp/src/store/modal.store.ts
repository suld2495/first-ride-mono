import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum ModalName {
  ROUTINE_ADD = 'routine_add',
  ROUTINE_EDIT = 'routine_edit',
  ROUTINE_DETAIL = 'routine_detail',
  ROUTINE_REQUEST = 'routine_request',
  REQUEST_DETAIL = 'request_detail',
}

interface State {
  name: ModalName | '';
}

interface Action {
  show: (name: ModalName) => void;
  close: () => void;
}

const init: State = {
  name: '',
};

export const useModalStore = create<State & Action>()(
  devtools((set) => ({
    ...init,

    show: (name: ModalName) => set({ name }),
    close: () => set({ name: '' }),
  })),
);
