import http from '@repo/shared/api/client';

const UPDATE_NOTICES_ENDPOINT = '/update-notices';

export interface UpdateNotice {
  id: number;
  displayOrder: number;
  title: string;
  description: string;
}

const isUpdateNotice = (value: unknown): value is UpdateNotice => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const notice = value as Record<string, unknown>;

  return (
    Number.isSafeInteger(notice.id) &&
    Number.isSafeInteger(notice.displayOrder) &&
    typeof notice.title === 'string' &&
    typeof notice.description === 'string'
  );
};

const parseUpdateNotices = (value: unknown): UpdateNotice[] => {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Update notices API returned invalid metadata');
  }

  const { updates } = value as Record<string, unknown>;

  if (!Array.isArray(updates) || !updates.every(isUpdateNotice)) {
    throw new Error('Update notices API returned invalid metadata');
  }

  return updates;
};

export const fetchUpdateNotices = (): Promise<UpdateNotice[]> =>
  http.get<unknown, never>(UPDATE_NOTICES_ENDPOINT).then(parseUpdateNotices);
