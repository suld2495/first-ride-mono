import { createPortal } from 'react-dom';

import { ModalName, useModalStore } from '@/store/modal.store';

import Modal from '../common/Modal';
import RequestDetailModal from '../modal/RequestDetailModal';
import RoutineAddModal from '../modal/RoutineAddModal';
import RoutineDetailModal from '../modal/RoutineDetailModal';
import RoutineEditModal from '../modal/RoutineEditModal';
import RoutineRequestModal from '../modal/RoutineRequestModal';

interface ModalContainerProps {
  name: ModalName;
}

const ModalContainer = ({ name }: ModalContainerProps) => {
  let title: string;
  let children: React.ReactNode;

  switch (name) {
    case ModalName.ROUTINE_ADD:
      title = '루틴 추가';
      children = <RoutineAddModal />;
      break;
    case ModalName.ROUTINE_EDIT:
      title = '루틴 수정';
      children = <RoutineEditModal />;
      break;
    case ModalName.ROUTINE_DETAIL:
      title = '루틴 확인';
      children = <RoutineDetailModal />;
      break;
    case ModalName.REQUEST_DETAIL:
      title = '루틴 확인 요청';
      children = <RequestDetailModal />;
      break;
    case ModalName.ROUTINE_REQUEST:
      title = '인증 요청';
      children = <RoutineRequestModal />;
      break;
    default:
      title = 'Unknown Modal';
      break;
  }

  return <Modal title={title}>{children}</Modal>;
};

const ModalProvider = () => {
  const name = useModalStore((state) => state.name);

  return (
    name &&
    createPortal(
      <ModalContainer name={name} />,
      document.getElementById('root')!,
    )
  );
};

export default ModalProvider;
