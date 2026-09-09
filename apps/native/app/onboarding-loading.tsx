import { Button, Text, View } from 'react-native';

import Loading from '@/components/ui/loading';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingLoading() {
  const { error, retry } = useOnboarding();
  if (error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>사용자 정보를 확인하지 못했어요. 다시 시도해주세요.</Text>
        <Button title="다시 시도" onPress={() => void retry()} />
      </View>
    );
  }
  return <Loading />;
}
