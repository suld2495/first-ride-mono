import { StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  size?: number;
  color: string;
}) => {
  return <FontAwesome style={styles.icon} size={20} {...props} />;
};

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});
