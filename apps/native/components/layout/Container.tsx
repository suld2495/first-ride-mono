import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ThemeView from '../common/ThemeView';

const Container = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <ThemeView
      style={[
        styles.container,
        { paddingTop: top, paddingBottom: bottom },
        style,
      ]}
    >
      {children}
    </ThemeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Container;