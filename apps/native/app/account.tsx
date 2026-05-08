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
import { Button } from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import PixelCard from '@/components/ui/pixel-card';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignIn, useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation } from '@/theme/tokens';

const MAX_MOTTO_LENGTH = 50;
const VISIBLE_MOTTO_COUNT = 3;
const DEFAULT_MOTTO = '한마디를 입력해주세요.';
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
  const [isAddingMotto, setIsAddingMotto] = useState(false);
  const [editingMotto, setEditingMotto] = useState<null | string>(null);
  const [isMottoListExpanded, setIsMottoListExpanded] = useState(false);
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
  const canToggleMottoList = currentMottos.length > VISIBLE_MOTTO_COUNT;
  const visibleMottos = isMottoListExpanded
    ? currentMottos
    : currentMottos.slice(0, VISIBLE_MOTTO_COUNT);

  useEffect(() => {
    if (fetchedUser) {
      signIn(fetchedUser);
    }
  }, [fetchedUser, signIn]);

  useEffect(() => {
    if (!isEditing) {
      setMotto(primaryMotto);
    }
  }, [isEditing, primaryMotto]);

  useEffect(() => {
    setSavedMottos(null);
    setIsMottoListExpanded(false);
  }, [displayUser?.userId]);

  useEffect(() => {
    if (currentMottos.length <= VISIBLE_MOTTO_COUNT) {
      setIsMottoListExpanded(false);
    }
  }, [currentMottos.length]);

  const displayMotto = primaryMotto || DEFAULT_MOTTO;

  const handleAdd = useCallback(() => {
    setMotto('');
    setIsAddingMotto(true);
    setEditingMotto(null);
    setIsEditing(true);
  }, []);

  const handleEditMotto = useCallback((targetMotto: string) => {
    setMotto(targetMotto);
    setEditingMotto(targetMotto);
    setIsAddingMotto(false);
    setIsEditing(true);
  }, []);

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

            setIsEditing(false);
            setIsAddingMotto(false);
            setEditingMotto(null);
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

  const handleSubmit = useCallback(() => {
    if (motto.length > MAX_MOTTO_LENGTH) {
      showToast('한마디는 50자 이하로 입력해주세요.', 'error');
      return;
    }

    const trimmedMotto = motto.trim();

    if (isAddingMotto) {
      if (!trimmedMotto) {
        setIsEditing(false);
        setIsAddingMotto(false);
        setEditingMotto(null);
        setMotto(primaryMotto);
        return;
      }

      updateMottos([...currentMottos, trimmedMotto]);
      return;
    }

    if (editingMotto) {
      updateMottos(
        currentMottos.map((item) =>
          item === editingMotto ? trimmedMotto : item,
        ),
      );
    }
  }, [
    currentMottos,
    editingMotto,
    isAddingMotto,
    motto,
    primaryMotto,
    showToast,
    updateMottos,
  ]);

  const handleRemoveMotto = useCallback(
    (targetMotto: string) => {
      updateMottos(currentMottos.filter((item) => item !== targetMotto));
    },
    [currentMottos, updateMottos],
  );

  const handleToggleMottoList = useCallback(() => {
    setIsMottoListExpanded((prev) => !prev);
  }, []);

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
                    accessibilityLabel="한마디"
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
                    color={primaryMotto ? 'primary' : 'tertiary'}
                    variant="subtitle1"
                    weight="semibold"
                    style={styles.mottoText}
                  >
                    {displayMotto}
                  </Typography>
                )}
              </View>
              {!isEditing && (
                <IconButton
                  accessibilityLabel="한마디 추가"
                  icon={({ color, size }) => (
                    <Ionicons name="add" color={color} size={size} />
                  )}
                  onPress={handleAdd}
                  size="md"
                  style={styles.roundButton}
                  variant="secondary"
                />
              )}
              {isEditing && (
                <IconButton
                  accessibilityLabel="한마디 저장"
                  disabled={updateMotto.isPending}
                  loading={updateMotto.isPending}
                  icon={({ color, size }) => (
                    <Ionicons name="checkmark" color={color} size={size} />
                  )}
                  onPress={handleSubmit}
                  size="md"
                  style={styles.roundButton}
                  variant="primary"
                />
              )}
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
            {currentMottos.length > 0 && (
              <View style={styles.mottoList}>
                {visibleMottos.map((item) => (
                  <View key={item} style={styles.mottoItem}>
                    <Typography
                      color="secondary"
                      variant="body2"
                      style={styles.mottoItemText}
                    >
                      {item}
                    </Typography>
                    <IconButton
                      accessibilityLabel={`${item} 수정`}
                      disabled={isEditing || updateMotto.isPending}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="create-outline"
                          color={color}
                          size={size}
                        />
                      )}
                      onPress={() => handleEditMotto(item)}
                      size="sm"
                      variant="ghost"
                    />
                    <IconButton
                      accessibilityLabel={`${item} 삭제`}
                      disabled={isEditing || updateMotto.isPending}
                      icon={({ color, size }) => (
                        <Ionicons
                          name="trash-outline"
                          color={color}
                          size={size}
                        />
                      )}
                      onPress={() => handleRemoveMotto(item)}
                      size="sm"
                      variant="ghost"
                    />
                  </View>
                ))}
                {canToggleMottoList && (
                  <Button
                    accessibilityLabel={
                      isMottoListExpanded
                        ? '한마디 목록 접기'
                        : '한마디 목록 더보기'
                    }
                    onPress={handleToggleMottoList}
                    rightIcon={({ color }) => (
                      <Ionicons
                        name={
                          isMottoListExpanded ? 'chevron-up' : 'chevron-down'
                        }
                        color={color}
                        size={baseFoundation.iconSize.s}
                      />
                    )}
                    size="sm"
                    style={styles.mottoToggleButton}
                    variant="ghost"
                  >
                    {isMottoListExpanded ? '접기' : '더보기'}
                  </Button>
                )}
              </View>
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
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
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
    paddingHorizontal: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[8],
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
    marginTop: theme.foundation.spacing[6],
  },
  mottoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
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
  mottoList: {
    gap: theme.foundation.spacing[1],
    marginTop: theme.foundation.spacing[3],
  },
  mottoItem: {
    minHeight: baseFoundation.dimension.x36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[2],
  },
  mottoItemText: {
    flex: 1,
  },
  mottoToggleButton: {
    alignSelf: 'center',
    marginTop: theme.foundation.spacing[1],
  },
  counter: {
    marginTop: theme.foundation.spacing[1],
    textAlign: 'right',
  },
  nickname: {
    marginTop: theme.foundation.spacing[2],
  },
}));
