import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useFetchMeQuery,
  useUpdateMottoMutation,
} from '@repo/shared/hooks/useUser';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';

import Container from '@/components/layout/container';
import {
  renderRoutineSceneAsset,
  routineSceneAssets,
} from '@/components/routine/routine-scene-art';
import IconButton from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import PixelCard from '@/components/ui/pixel-card';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignIn, useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation } from '@/theme/tokens';

const MAX_MOTTO_LENGTH = 50;
const DEFAULT_MOTTO = '좌우명을 입력해주세요.';

const Account = () => {
  const router = useRouter();
  const user = useAuthUser();
  const signIn = useAuthSignIn();
  const { showToast } = useToast();
  const { data: fetchedUser } = useFetchMeQuery();
  const updateMotto = useUpdateMottoMutation();
  const displayUser = fetchedUser ?? user;
  const currentMotto = displayUser?.motto ?? '';
  const [isEditing, setIsEditing] = useState(false);
  const [motto, setMotto] = useState(currentMotto);

  useEffect(() => {
    if (fetchedUser) {
      signIn(fetchedUser);
    }
  }, [fetchedUser, signIn]);

  useEffect(() => {
    if (!isEditing) {
      setMotto(currentMotto);
    }
  }, [currentMotto, isEditing]);

  const displayMotto = useMemo(
    () => (currentMotto.trim().length > 0 ? currentMotto : DEFAULT_MOTTO),
    [currentMotto],
  );

  const handleEdit = useCallback(() => {
    setMotto(currentMotto);
    setIsEditing(true);
  }, [currentMotto]);

  const handleSubmit = useCallback(() => {
    if (motto.length > MAX_MOTTO_LENGTH) {
      showToast('좌우명은 50자 이하로 입력해주세요.', 'error');
      return;
    }

    updateMotto.mutate(
      {
        motto: motto.trim().length > 0 ? motto : null,
      },
      {
        onSuccess: (updatedUser) => {
          const nextUser =
            updatedUser ??
            (displayUser
              ? {
                  ...displayUser,
                  motto: motto.trim().length > 0 ? motto : null,
                }
              : undefined);

          if (nextUser) {
            signIn(nextUser);
          }

          setIsEditing(false);
          showToast('좌우명이 수정되었습니다.', 'success');
        },
        onError: (error) => {
          const message =
            error instanceof Error
              ? error.message
              : '좌우명 수정에 실패했습니다.';

          showToast(message, 'error');
        },
      },
    );
  }, [displayUser, motto, showToast, signIn, updateMotto]);

  return (
    <Container noPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <IconButton
            accessibilityLabel="뒤로가기"
            icon={({ color, size }) => (
              <Ionicons name="chevron-back" color={color} size={size} />
            )}
            onPress={() => router.back()}
            variant="ghost"
          />
          <Typography variant="title" weight="semibold" style={styles.title}>
            계정
          </Typography>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.characterWrap}>
            {renderRoutineSceneAsset(routineSceneAssets.character, {
              style: styles.character,
            })}
          </View>

          <PixelCard style={styles.mottoCard}>
            <View style={styles.mottoRow}>
              <View style={styles.mottoContent}>
                {isEditing ? (
                  <Input
                    accessibilityLabel="좌우명"
                    autoFocus
                    fullWidth
                    onChangeText={setMotto}
                    placeholder={DEFAULT_MOTTO}
                    returnKeyType="done"
                    size="md"
                    value={motto}
                    onSubmitEditing={handleSubmit}
                  />
                ) : (
                  <Typography
                    color={currentMotto ? 'primary' : 'tertiary'}
                    variant="subtitle1"
                    weight="semibold"
                    style={styles.mottoText}
                  >
                    {displayMotto}
                  </Typography>
                )}
              </View>
              <IconButton
                accessibilityLabel={isEditing ? '좌우명 저장' : '좌우명 수정'}
                disabled={updateMotto.isPending}
                loading={updateMotto.isPending}
                icon={({ color, size }) => (
                  <Ionicons
                    name={isEditing ? 'checkmark' : 'create-outline'}
                    color={color}
                    size={size}
                  />
                )}
                onPress={isEditing ? handleSubmit : handleEdit}
                size="md"
                style={styles.roundButton}
                variant={isEditing ? 'primary' : 'secondary'}
              />
            </View>
            {isEditing && (
              <Typography
                color={motto.length > MAX_MOTTO_LENGTH ? 'error' : 'tertiary'}
                variant="caption2"
                style={styles.counter}
              >
                {motto.length}/{MAX_MOTTO_LENGTH}
              </Typography>
            )}
          </PixelCard>

          <Typography color="secondary" variant="body2" style={styles.nickname}>
            {displayUser?.nickname}
          </Typography>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default Account;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.s,
  },
  title: {
    textAlign: 'center',
  },
  headerSpacer: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.foundation.spacing.m,
    paddingTop: theme.foundation.spacing.xl,
  },
  characterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  character: {
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x120,
  },
  mottoCard: {
    alignSelf: 'stretch',
    marginTop: theme.foundation.spacing.l,
  },
  mottoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.s,
  },
  mottoContent: {
    flex: 1,
    minHeight: baseFoundation.dimension.x44,
    justifyContent: 'center',
  },
  mottoText: {
    lineHeight: baseFoundation.dimension.x24,
  },
  roundButton: {
    borderRadius: 999,
  },
  counter: {
    marginTop: theme.foundation.spacing.xs,
    textAlign: 'right',
  },
  nickname: {
    marginTop: theme.foundation.spacing.s,
  },
}));
