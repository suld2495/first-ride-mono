import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import ModalHeaderAction from '@/components/modal/modal-header-action';
import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignIn, useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { baseFoundation, palette } from '@/theme/tokens';

const MAX_MOTTO_LENGTH = 50;
const getSkinLevel5Color = (themeName: string) => {
  if (themeName === 'green') {
    return palette.theme.green[5];
  }

  if (themeName === 'red') {
    return palette.theme.red[5];
  }

  return palette.theme.blue[5];
};
const getSkinLevel50Color = (themeName: string) => {
  if (themeName === 'green') {
    return palette.theme.green[50];
  }

  if (themeName === 'red') {
    return palette.theme.red[50];
  }

  return palette.theme.blue[50];
};

const normalizeMottos = (mottos: string[]): string[] => {
  const seen = new Set<string>();

  return mottos
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false;
      }

      seen.add(item);
      return true;
    });
};

const Account = () => {
  const themeName = useColorScheme();
  const user = useAuthUser();
  const signIn = useAuthSignIn();
  const { showToast } = useToast();
  const { data: fetchedUser } = useFetchMeQuery();
  const updateMotto = useUpdateMottoMutation();
  const displayUser = fetchedUser ?? user;
  const currentMotto = displayUser?.motto ?? '';
  const [primaryMottoInput, setPrimaryMottoInput] = useState(currentMotto);
  const [savedMottos, setSavedMottos] = useState<string[] | null>(null);
  const serverMottos = useMemo(
    () =>
      normalizeMottos(
        displayUser?.mottos?.length ? displayUser.mottos : [currentMotto],
      ),
    [currentMotto, displayUser?.mottos],
  );
  const currentMottos = savedMottos ?? serverMottos;
  const primaryMotto = currentMottos[0] ?? '';
  const hasPrimaryMottoChanged = primaryMottoInput !== primaryMotto;

  useEffect(() => {
    if (fetchedUser) {
      signIn(fetchedUser);
    }
  }, [fetchedUser, signIn]);

  useEffect(() => {
    setPrimaryMottoInput(primaryMotto);
  }, [primaryMotto]);

  useEffect(() => {
    setSavedMottos(null);
  }, [displayUser?.userId]);

  const updateMottos = useCallback(
    (nextMottos: string[]) => {
      const normalizedMottos = normalizeMottos(nextMottos);
      const nextPrimaryMotto = normalizedMottos[0] ?? null;

      updateMotto.mutate(
        {
          mottos: normalizedMottos,
        },
        {
          onSuccess: (updatedUser) => {
            const nextUser =
              updatedUser ??
              (displayUser
                ? {
                    ...displayUser,
                    motto: nextPrimaryMotto,
                    mottos: normalizedMottos,
                  }
                : undefined);

            if (nextUser) {
              signIn(nextUser);
            }

            showToast('한마디가 수정되었습니다.', 'success');
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : '한마디 수정에 실패했습니다.';

            setSavedMottos(null);
            showToast(message, 'error');
          },
        },
      );

      setSavedMottos(normalizedMottos);
    },
    [displayUser, showToast, signIn, updateMotto],
  );

  const handlePrimaryMottoSubmit = useCallback(() => {
    if (!hasPrimaryMottoChanged) {
      return;
    }

    if (primaryMottoInput.length > MAX_MOTTO_LENGTH) {
      showToast('한마디는 50자 이하로 입력해주세요.', 'error');
      return;
    }

    const trimmedMotto = primaryMottoInput.trim();
    const remainingMottos = currentMottos.slice(1);

    updateMottos(
      trimmedMotto ? [trimmedMotto, ...remainingMottos] : remainingMottos,
    );
  }, [
    currentMottos,
    hasPrimaryMottoChanged,
    primaryMottoInput,
    showToast,
    updateMottos,
  ]);

  return (
    <>
      <ModalHeaderAction>
        <Button
          accessibilityLabel="한마디 상단 저장"
          disabled={updateMotto.isPending || !hasPrimaryMottoChanged}
          loading={updateMotto.isPending}
          onPress={handlePrimaryMottoSubmit}
          size="sm"
          style={styles.headerSaveButton}
          textColor={palette.white}
          textStyle={styles.headerSaveButtonText}
          variant="ghost"
        >
          저장
        </Button>
      </ModalHeaderAction>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View testID="account-content" style={styles.content}>
          <View style={styles.characterWrap}>
            <View
              testID="account-character-container"
              style={styles.characterContainer}
            >
              {renderRoutineSceneAsset(
                getRoutineSceneCharacterAsset(themeName),
                {
                  testID: 'account-character',
                  style: styles.character,
                },
              )}
            </View>
          </View>

          <View
            testID="account-motto-input-wrapper"
            style={styles.mottoInputWrapper}
          >
            <Input
              accessibilityLabel="한마디 입력"
              containerTestID="account-motto-input-container"
              fullWidth
              inputStyle={styles.mottoInputText}
              onChangeText={setPrimaryMottoInput}
              onSubmitEditing={handlePrimaryMottoSubmit}
              placeholder="한마디를 입력하세요"
              returnKeyType="done"
              size="md"
              style={styles.mottoInputContainer}
              testID="account-motto-input"
              value={primaryMottoInput}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default Account;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: theme.foundation.spacing[3],
  },
  characterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  characterContainer: {
    width: 138,
    height: 138,
    borderRadius: 12,
    backgroundColor: getSkinLevel5Color(theme.name),
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    width: 100,
    height: 100,
  },
  mottoInputWrapper: {
    width: '100%',
    marginTop: 16,
  },
  mottoInputContainer: {
    height: 44,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: getSkinLevel50Color(theme.name),
    paddingHorizontal: 0,
  },
  mottoInputText: {
    color: palette.theme.gray[70],
    fontSize: baseFoundation.typography.size.body2,
    fontWeight: baseFoundation.typography.weight.semibold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  headerSaveButton: {
    width: 56,
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: palette.theme.gray[90],
  },
  headerSaveButtonText: {
    fontSize: baseFoundation.typography.size.body3,
    fontWeight: baseFoundation.typography.weight.regular,
  },
}));
