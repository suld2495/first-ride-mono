import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import ModalHeaderAction from '@/components/modal/modal-header-action';
import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignIn, useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation, palette } from '@/theme/tokens';

const MAX_MOTTO_CHARACTERS = 26;
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

const getMottoCharacterCountLabel = (value: string) =>
  `${Array.from(value).length}/${MAX_MOTTO_CHARACTERS}자`;

const limitMottoCharacters = (value: string) =>
  Array.from(value).slice(0, MAX_MOTTO_CHARACTERS).join('');

const Account = () => {
  const user = useAuthUser();
  const signIn = useAuthSignIn();
  const { showToast } = useToast();
  const { data: fetchedUser } = useFetchMeQuery(user?.userId);
  const updateMotto = useUpdateMottoMutation();
  const displayUser = fetchedUser ?? user;
  const characterAsset = getRoutineSceneRemoteAsset(
    fetchedUser?.characterImageUrl,
  );
  const currentMotto = displayUser?.motto ?? '';
  const [primaryMottoInput, setPrimaryMottoInput] = useState(currentMotto);
  const [savedMotto, setSavedMotto] = useState<null | string | undefined>();
  const primaryMotto =
    savedMotto === undefined ? currentMotto : (savedMotto ?? '');
  const hasPrimaryMottoChanged = primaryMottoInput !== primaryMotto;
  const primaryMottoCharacterCountLabel =
    getMottoCharacterCountLabel(primaryMottoInput);

  useEffect(() => {
    if (fetchedUser) {
      signIn(fetchedUser);
    }
  }, [fetchedUser, signIn]);

  useEffect(() => {
    setPrimaryMottoInput(primaryMotto);
  }, [primaryMotto]);

  useEffect(() => {
    setSavedMotto(undefined);
  }, [displayUser?.userId]);

  const updatePrimaryMotto = useCallback(
    (nextPrimaryMotto: null | string) => {
      updateMotto.mutate(
        {
          motto: nextPrimaryMotto,
        },
        {
          onSuccess: (updatedUser) => {
            signIn(updatedUser);

            showToast('한마디가 수정되었습니다.', 'success');
          },
          onError: (error) => {
            const message =
              error instanceof Error
                ? error.message
                : '한마디 수정에 실패했습니다.';

            setSavedMotto(undefined);
            showToast(message, 'error');
          },
        },
      );

      setSavedMotto(nextPrimaryMotto);
    },
    [showToast, signIn, updateMotto],
  );

  const handlePrimaryMottoSubmit = useCallback(() => {
    if (!hasPrimaryMottoChanged) {
      return;
    }

    const trimmedMotto = primaryMottoInput.trim();

    updatePrimaryMotto(trimmedMotto || null);
  }, [hasPrimaryMottoChanged, primaryMottoInput, updatePrimaryMotto]);

  const handlePrimaryMottoChange = useCallback((value: string) => {
    setPrimaryMottoInput(limitMottoCharacters(value));
  }, []);

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
              {characterAsset
                ? renderRoutineSceneAsset(characterAsset, {
                    testID: 'account-character',
                    style: styles.character,
                  })
                : null}
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
              onChangeText={handlePrimaryMottoChange}
              onSubmitEditing={handlePrimaryMottoSubmit}
              placeholder="한마디를 입력하세요"
              returnKeyType="done"
              size="md"
              style={styles.mottoInputContainer}
              testID="account-motto-input"
              value={primaryMottoInput}
            />
            <Typography
              testID="account-motto-byte-counter"
              variant="caption2"
              weight="semibold"
              style={styles.mottoByteCounter}
            >
              {primaryMottoCharacterCountLabel}
            </Typography>
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
    paddingTop: 0,
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
    width: 112,
    height: 112,
    transform: [{ translateY: -12 }],
  },
  mottoInputWrapper: {
    width: '100%',
    marginTop: 16,
  },
  mottoByteCounter: {
    color: theme.colors.brand.routineProgressText,
    marginTop: 6,
    paddingRight: 4,
    textAlign: 'right',
  },
  mottoInputContainer: {
    height: 44,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: getSkinLevel50Color(theme.name),
    paddingHorizontal: 0,
  },
  mottoInputText: {
    color: theme.colors.text.label,
    fontSize: baseFoundation.typography.size.body2,
    fontWeight: baseFoundation.typography.weight.semibold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  headerSaveButton: {
    width: 56,
    height: 34,
    borderRadius: 8,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: theme.colors.text.gray,
  },
  headerSaveButtonText: {
    fontSize: baseFoundation.typography.size.body3,
    fontWeight: baseFoundation.typography.weight.regular,
  },
}));
