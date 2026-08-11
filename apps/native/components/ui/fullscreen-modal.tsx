import { Modal as NativeModal, Platform, type ModalProps } from 'react-native';

type FullscreenModalProps = Omit<
  ModalProps,
  'navigationBarTranslucent' | 'statusBarTranslucent'
>;

const FullscreenModal = (props: FullscreenModalProps) => {
  const systemBarsTranslucent = Platform.OS === 'android' ? true : undefined;

  return (
    <NativeModal
      {...props}
      navigationBarTranslucent={systemBarsTranslucent}
      statusBarTranslucent={systemBarsTranslucent}
    />
  );
};

export default FullscreenModal;
