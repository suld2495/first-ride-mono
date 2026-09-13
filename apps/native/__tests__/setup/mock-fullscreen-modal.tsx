import { useEffect, useRef } from 'react';
import { Modal, type ModalProps } from 'react-native';

// iOS의 네이티브 Modal처럼 visible이 true → false로 바뀌면 onDismiss를 호출한다.
// '다이얼로그 닫힘 → 사진 선택기 실행' 경로를 테스트에서 재현하기 위한 FullscreenModal 대체 구현.
const MockFullscreenModal = ({ onDismiss, visible, ...props }: ModalProps) => {
  const wasVisibleRef = useRef(Boolean(visible));

  useEffect(() => {
    if (wasVisibleRef.current && !visible) {
      onDismiss?.();
    }

    wasVisibleRef.current = Boolean(visible);
  }, [onDismiss, visible]);

  return <Modal {...props} visible={visible} onDismiss={onDismiss} />;
};

export default MockFullscreenModal;
