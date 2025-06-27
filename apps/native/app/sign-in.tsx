import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/Button';
import ThemeTextInput from '@/components/common/ThemeTextInput';
import ThemeView from '@/components/common/ThemeView';
import { useUserStore } from '@/store/user.store';

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const { signIn } = useUserStore();

  const handleLogin = () => {
    signIn({ name: username });
    router.push('/(tabs)/(afterLogin)/(routine)');
  };

  return (
    <ThemeView style={styles.container}>
      <ThemeTextInput
        width={200}
        placeholder="이름을 입력해주세요."
        onChangeText={setUsername}
      />
      <Button title="로그인" onPress={handleLogin} />
    </ThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
