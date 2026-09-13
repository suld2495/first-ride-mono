import { router, useRouter } from 'expo-router';
import { useContext } from 'react';

import PageHeader from '@/components/layout/page-header';
import ModalHeaderActionContext from '@/components/modal/modal-header-action-context';
import { StyleSheet } from '@/components/ui/tamagui';

interface ModalHeaderProps {
  title: string;
  transparent?: boolean;
  titleColor?: string;
  backIconColor?: string;
  onBackPress?: () => void;
}

const ModalHeader = ({
  title,
  transparent = false,
  titleColor,
  backIconColor,
  onBackPress,
}: ModalHeaderProps) => {
  const modalRouter = useRouter();
  const isPresented = router.canGoBack();
  const actionContext = useContext(ModalHeaderActionContext);
  const headerAction = actionContext?.action ?? null;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (isPresented) {
      modalRouter.back();
    } else {
      modalRouter.replace('/');
    }
  };

  return (
    <PageHeader
      title={title}
      showBackButton
      onBackPress={handleBack}
      right={headerAction}
      titleColor={titleColor}
      backIconColor={backIconColor}
      style={!transparent && styles.container}
    />
  );
};

export default ModalHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.base,
  },
}));
