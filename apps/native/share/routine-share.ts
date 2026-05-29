import type { Routine } from '@repo/types';
import { NativeModules, Platform } from 'react-native';

import type { RequestImage } from '@/hooks/useRequestSubmission';

export const ROUTINE_SHARE_APP_GROUP_IDENTIFIER = 'group.com.mannal.firstride';
export const ROUTINE_SHARE_TARGETS_KEY = 'routineShareTargetsV2';
export const LEGACY_ROUTINE_SHARE_TARGETS_KEY = 'routineShareTargets';
export const PENDING_ROUTINE_SHARE_KEY = 'pendingRoutineShare';

const ROUTINE_SHARE_SCHEME = 'first-ride';
const MAX_SHARE_TARGET_COUNT = 8;
const MAX_SHARED_IMAGE_COUNT = 3;

export interface RoutineShareTarget {
  id: number;
  title: string;
  subtitle: string;
}

export interface RoutineShareTargetsPayload {
  version: 2;
  status: 'signedIn' | 'signedOut';
  generatedAt: string;
  targets: RoutineShareTarget[];
}

export interface PendingRoutineSharePayload {
  sessionId: string;
  routineId: number;
  createdAt: string;
  images: RequestImage[];
}

interface RoutineShareNativeModule {
  publishShareTargets: (targetsJson: string) => Promise<void>;
  clearShareTargets: () => Promise<void>;
  getPendingShare: () => Promise<string | null>;
  clearPendingShare: (sessionId?: string | null) => Promise<void>;
}

type ExtensionStorageInstance = {
  set: (key: string, value: string | undefined) => void;
  get: (key: string) => string | null;
  remove: (key: string) => void;
};

type ExtensionStorageConstructor = new (
  appGroup: string,
) => ExtensionStorageInstance;

const nativeModule = NativeModules.RoutineShare as
  | RoutineShareNativeModule
  | undefined;

const isIos = () => Platform.OS === 'ios' || process.env.EXPO_OS === 'ios';

const createExtensionStorage = (): ExtensionStorageInstance | null => {
  try {
    // Lazy import keeps unit tests and Android bundles away from the iOS-only module.

    const module = require('@bacons/apple-targets') as {
      ExtensionStorage?: ExtensionStorageConstructor;
    };
    const { ExtensionStorage } = module;

    return ExtensionStorage
      ? new ExtensionStorage(ROUTINE_SHARE_APP_GROUP_IDENTIFIER)
      : null;
  } catch {
    return null;
  }
};

const isUsableRoutine = (routine: Routine): boolean =>
  routine.routineCount > 0 &&
  routine.weeklyCount < routine.routineCount;

const createTargetSubtitle = (routine: Routine): string =>
  routine.isMe ? '나에게 인증' : `${routine.mateNickname}에게 인증`;

export const createRoutineShareTargets = (
  routines: Routine[],
): RoutineShareTarget[] =>
  routines
    .filter(isUsableRoutine)
    .slice(0, MAX_SHARE_TARGET_COUNT)
    .map((routine) => ({
      id: routine.routineId,
      title: routine.routineName,
      subtitle: createTargetSubtitle(routine),
    }));

export const createRoutineShareTargetsPayload = (
  routines: Routine[],
): RoutineShareTargetsPayload => ({
  version: 2,
  status: 'signedIn',
  generatedAt: new Date().toISOString(),
  targets: createRoutineShareTargets(routines),
});

export const createSignedOutRoutineShareTargetsPayload =
  (): RoutineShareTargetsPayload => ({
    version: 2,
    status: 'signedOut',
    generatedAt: new Date().toISOString(),
    targets: [],
  });

export const buildRoutineSharePath = (
  routineId: number,
  shareSessionId: string,
): string =>
  `/modal?type=request&routineId=${encodeURIComponent(
    routineId,
  )}&shareSessionId=${encodeURIComponent(shareSessionId)}`;

export const buildRoutineShareUrl = (
  routineId: number,
  shareSessionId: string,
): string =>
  `${ROUTINE_SHARE_SCHEME}://${buildRoutineSharePath(
    routineId,
    shareSessionId,
  )}`;

const isRequestImage = (value: unknown): value is RequestImage => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const image = value as Partial<RequestImage>;

  return (
    typeof image.base64 === 'string' &&
    image.base64.length > 0 &&
    typeof image.previewUri === 'string' &&
    image.previewUri.length > 0
  );
};

export const parsePendingRoutineSharePayload = (
  rawPayload: string | null | undefined,
  expectedSessionId?: string,
): PendingRoutineSharePayload | null => {
  if (!rawPayload) {
    return null;
  }

  try {
    const payload = JSON.parse(
      rawPayload,
    ) as Partial<PendingRoutineSharePayload>;

    if (
      typeof payload.sessionId !== 'string' ||
      typeof payload.routineId !== 'number' ||
      typeof payload.createdAt !== 'string' ||
      !Array.isArray(payload.images)
    ) {
      return null;
    }

    if (expectedSessionId && payload.sessionId !== expectedSessionId) {
      return null;
    }

    const images = payload.images
      .filter(isRequestImage)
      .slice(0, MAX_SHARED_IMAGE_COUNT);

    if (!images.length) {
      return null;
    }

    return {
      sessionId: payload.sessionId,
      routineId: payload.routineId,
      createdAt: payload.createdAt,
      images,
    };
  } catch {
    return null;
  }
};

export const syncRoutineShareTargets = async (
  routines: Routine[],
): Promise<void> => {
  const targets = createRoutineShareTargets(routines);
  const targetsJson = JSON.stringify(targets);

  if (isIos()) {
    const storage = createExtensionStorage();

    storage?.set(
      ROUTINE_SHARE_TARGETS_KEY,
      JSON.stringify({
        version: 2,
        status: 'signedIn',
        generatedAt: new Date().toISOString(),
        targets,
      } satisfies RoutineShareTargetsPayload),
    );
    storage?.remove(LEGACY_ROUTINE_SHARE_TARGETS_KEY);
  }

  if (nativeModule) {
    await nativeModule.publishShareTargets(targetsJson);
  }
};

export const clearRoutineShareTargets = async (): Promise<void> => {
  if (isIos()) {
    const storage = createExtensionStorage();

    storage?.set(
      ROUTINE_SHARE_TARGETS_KEY,
      JSON.stringify(createSignedOutRoutineShareTargetsPayload()),
    );
    storage?.remove(LEGACY_ROUTINE_SHARE_TARGETS_KEY);
    storage?.remove(PENDING_ROUTINE_SHARE_KEY);
  }

  if (nativeModule) {
    await nativeModule.clearShareTargets();
    await nativeModule.clearPendingShare();
  }
};

export const getPendingRoutineShare = async (
  expectedSessionId?: string,
): Promise<PendingRoutineSharePayload | null> => {
  const rawPayload = isIos()
    ? createExtensionStorage()?.get(PENDING_ROUTINE_SHARE_KEY)
    : await nativeModule?.getPendingShare();

  return parsePendingRoutineSharePayload(rawPayload, expectedSessionId);
};

export const clearPendingRoutineShare = async (
  sessionId?: string,
): Promise<void> => {
  if (isIos()) {
    const storage = createExtensionStorage();
    const pendingPayload = parsePendingRoutineSharePayload(
      storage?.get(PENDING_ROUTINE_SHARE_KEY),
      sessionId,
    );

    if (pendingPayload) {
      storage?.remove(PENDING_ROUTINE_SHARE_KEY);
    }
  }

  if (nativeModule) {
    await nativeModule.clearPendingShare(sessionId ?? null);
  }
};
