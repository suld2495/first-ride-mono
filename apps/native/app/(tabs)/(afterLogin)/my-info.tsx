import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import ThemeText from '@/components/common/ThemeText';
import ThemeView from '@/components/common/ThemeView';
import Container from '@/components/layout/Container';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';

const MyInfo = () => {
  const user = useAuthStore((state) => state.user);
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleMoveFeedback = async () => {
    await WebBrowser.openBrowserAsync(Constants.expoConfig?.extra?.feedback);
  };

  return (
    <Container>
      <ThemeView style={styles.container}>
        <ThemeText variant="title">{user?.name}</ThemeText>
      </ThemeView>
      <ThemeView style={styles.linkContainer}>
        <Link
          variant="plain"
          href="/modal?type=policies"
          title="약관 및 정책"
          icon={
            <Ionicons
              name="newspaper-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={styles.link}
        />
        <Link
          variant="plain"
          href="/modal?type=privacy"
          title="개인정보 처리방침"
          icon={
            <Ionicons
              name="key-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={styles.link}
        />
        <Button
          variant="plain"
          title="처음처럼에 피드백을 남겨주세요!"
          icon={
            <Ionicons
              name="heart-circle-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={[styles.link, styles.feedback]}
          onPress={handleMoveFeedback}
        />
      </ThemeView>
    </Container>
  );
};

export default MyInfo;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },

    linkContainer: {
      marginTop: 20,
    },

    link: {
      alignItems: 'flex-start',
    },

    feedback: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },
  });
