import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import ModalHeaderAction from '@/components/modal/modal-header-action';
import {
  getRoutineSceneCharacterAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignIn, useAuthUser } from '@/hooks/useAuthSession';
import { useColorScheme } from '@/hooks/useColorScheme';
import { baseFoundation, palette } from '@/theme/tokens';

const MAX_MOTTO_BYTES = 80;
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

const getUtf8ByteLength = (value: string) => {
  let byteLength = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;

    if (codePoint <= 0x7f) {
      byteLength += 1;
    } else if (codePoint <= 0x7ff) {
      byteLength += 2;
    } else if (codePoint <= 0xffff) {
      byteLength += 3;
    } else {
      byteLength += 4;
    }
  }

  return byteLength;
};

const limitMottoBytes = (value: string) => {
  let nextValue = '';
  let byteLength = 0;

  for (const character of value) {
    const characterByteLength = getUtf8ByteLength(character);

    if (byteLength + characterByteLength > MAX_MOTTO_BYTES) {
      break;
    }

    nextValue += character;
    byteLength += characterByteLength;
  }

  return nextValue;
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
  const [savedMotto, setSavedMotto] = useState<null | string | undefined>();
  const primaryMotto =
    savedMotto === undefined ? currentMotto : (savedMotto ?? '');
  const hasPrimaryMottoChanged = primaryMottoInput !== primaryMotto;
  const primaryMottoByteLength = getUtf8ByteLength(primaryMottoInput);

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
    setPrimaryMottoInput(limitMottoBytes(value));
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
              color={palette.theme.gray[60]}
              testID="account-motto-byte-counter"
              variant="caption2"
              weight="semibold"
              style={styles.mottoByteCounter}
            >
              {primaryMottoByteLength}
              {` / ${MAX_MOTTO_BYTES}byte`}
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
  mottoByteCounter: {
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
    paddingHorizontal: 20,
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
