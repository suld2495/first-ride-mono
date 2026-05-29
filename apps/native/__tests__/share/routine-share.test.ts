import type { Routine } from '@repo/types';

import {
  buildRoutineSharePath,
  buildRoutineShareUrl,
  createSignedOutRoutineShareTargetsPayload,
  createRoutineShareTargets,
  createRoutineShareTargetsPayload,
  parsePendingRoutineSharePayload,
} from '@/share/routine-share';

const createRoutine = (
  id: number,
  overrides: Partial<Routine> = {},
): Routine => ({
  routineId: id,
  nickname: 'testuser',
  routineName: `루틴 ${id}`,
  routineDetail: `${id} 상세`,
  penalty: 0,
  weeklyCount: 0,
  routineCount: 3,
  mateNickname: 'mate',
  isMe: false,
  startDate: '2026-05-25',
  successDate: [],
  paused: false,
  hidden: false,
  hasPendingConfirmation: false,
  pendingConfirmationCount: 0,
  pendingConfirmationIds: [],
  ...overrides,
});

describe('routine share', () => {
  it('creates share targets for this week routines that still need certification', () => {
    const targets = createRoutineShareTargets([
      createRoutine(1, { routineName: '아침 운동' }),
      createRoutine(2, { routineName: '숨김 루틴', hidden: true }),
      createRoutine(3, { routineName: '정지 루틴', paused: true }),
      createRoutine(4, {
        routineName: '완료 루틴',
        weeklyCount: 3,
        routineCount: 3,
      }),
    ]);

    expect(targets).toEqual([
      {
        id: 1,
        title: '아침 운동',
        subtitle: 'mate에게 인증',
      },
      {
        id: 2,
        title: '숨김 루틴',
        subtitle: 'mate에게 인증',
      },
      {
        id: 3,
        title: '정지 루틴',
        subtitle: 'mate에게 인증',
      },
    ]);
  });

  it('builds the certification request path with routine and share session ids', () => {
    expect(buildRoutineSharePath(12, 'session-1')).toBe(
      '/modal?type=request&routineId=12&shareSessionId=session-1',
    );
  });

  it('builds the certification request url with an absolute app route', () => {
    expect(buildRoutineShareUrl(12, 'session-1')).toBe(
      'first-ride:///modal?type=request&routineId=12&shareSessionId=session-1',
    );
  });

  it('wraps share targets in a versioned signed-in payload', () => {
    const payload = createRoutineShareTargetsPayload([
      createRoutine(1, { routineName: '아침 운동' }),
    ]);

    expect(payload).toMatchObject({
      version: 2,
      status: 'signedIn',
      targets: [
        {
          id: 1,
          title: '아침 운동',
          subtitle: 'mate에게 인증',
        },
      ],
    });
    expect(typeof payload.generatedAt).toBe('string');
  });

  it('creates a signed-out payload with no share targets', () => {
    const payload = createSignedOutRoutineShareTargetsPayload();

    expect(payload).toMatchObject({
      version: 2,
      status: 'signedOut',
      targets: [],
    });
    expect(typeof payload.generatedAt).toBe('string');
  });

  it('parses pending share payloads and ignores mismatched sessions', () => {
    const raw = JSON.stringify({
      sessionId: 'session-1',
      routineId: 12,
      createdAt: '2026-05-29T00:00:00.000Z',
      images: [{ base64: 'abc', previewUri: 'file:///shared.jpg' }],
    });

    expect(parsePendingRoutineSharePayload(raw, 'session-1')).toEqual({
      sessionId: 'session-1',
      routineId: 12,
      createdAt: '2026-05-29T00:00:00.000Z',
      images: [{ base64: 'abc', previewUri: 'file:///shared.jpg' }],
    });
    expect(parsePendingRoutineSharePayload(raw, 'other-session')).toBeNull();
  });
});
