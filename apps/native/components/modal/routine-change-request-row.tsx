import Ionicons from '@expo/vector-icons/Ionicons';
import type { RoutineChangeRequest as RoutineChangeRequestResponse } from '@repo/types';
import { Pressable } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface RoutineChangeListItem {
  field: string;
  label: string;
  before: string;
  after: string;
  beforeColor?: string;
  afterColor?: string;
}

export interface RoutineChangeRequestListItem {
  id: number;
  routineName: string;
  requesterNickname: string;
  requestedLabel: string;
  requestedDetailLabel: string;
  expiresLabel: string;
  expiresDetailLabel: string;
  dDayLabel: string;
  changes: readonly RoutineChangeListItem[];
}

interface RoutineChangeRequestRowProps {
  isExpanded: boolean;
  isResolving: boolean;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onToggle: (requestId: number) => void;
  request: RoutineChangeRequestListItem;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const KOREAN_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const HEX_COLOR_PATTERN =
  /^#(?:[\dA-Fa-f]{3}|[\dA-Fa-f]{4}|[\dA-Fa-f]{6}|[\dA-Fa-f]{8})$/;

const parseLocalDate = (value: string): Date | null => {
  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatShortDate = (value: string): string => {
  const date = parseLocalDate(value);

  return date ? `${date.getMonth() + 1}월 ${date.getDate()}일` : value;
};

const formatDetailedDate = (value: string): string => {
  const date = parseLocalDate(value);

  if (!date) return value;

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${KOREAN_WEEKDAYS[date.getDay()]})`;
};

const formatDday = (expiresAt: string, now: Date): string => {
  const expiresDate = parseLocalDate(expiresAt);

  if (!expiresDate) return '-';

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiresStart = new Date(
    expiresDate.getFullYear(),
    expiresDate.getMonth(),
    expiresDate.getDate(),
  );
  const remainingDays = Math.round(
    (expiresStart.getTime() - todayStart.getTime()) / MILLISECONDS_PER_DAY,
  );

  if (remainingDays === 0) return 'D-Day';

  return remainingDays > 0
    ? `D-${remainingDays}`
    : `D+${Math.abs(remainingDays)}`;
};

type ChangeValueFormatter = (value: unknown) => string | undefined;

const formatBooleanChangeValue = (
  value: unknown,
  trueLabel: string,
  falseLabel: string,
): string | undefined => {
  if (typeof value !== 'boolean') return undefined;

  return value ? trueLabel : falseLabel;
};

const CHANGE_VALUE_FORMATTERS: Readonly<
  Partial<Record<string, ChangeValueFormatter>>
> = {
  routineCount: (value) =>
    typeof value === 'number' ? `주 ${value}회` : undefined,
  penalty: (value) =>
    typeof value === 'number'
      ? `${value.toLocaleString('ko-KR')}원`
      : undefined,
  startDate: (value) =>
    typeof value === 'string' ? formatDetailedDate(value) : undefined,
  endDate: (value) =>
    typeof value === 'string' ? formatDetailedDate(value) : undefined,
  hidden: (value) => formatBooleanChangeValue(value, '숨김', '표시'),
  paused: (value) => formatBooleanChangeValue(value, '일시정지', '진행'),
};

const isEmptyChangeValue = (value: unknown): boolean =>
  value === null || value === undefined || value === '';

const formatChangeValue = (field: string, value: unknown): string => {
  if (isEmptyChangeValue(value)) return '없음';

  const formattedValue = CHANGE_VALUE_FORMATTERS[field]?.(value);

  if (formattedValue !== undefined) return formattedValue;

  if (typeof value === 'object') {
    return JSON.stringify(value) ?? String(value);
  }

  return String(value);
};

const getSymbolColor = (field: string, value: unknown): string | undefined =>
  field === 'symbolColor' &&
  typeof value === 'string' &&
  HEX_COLOR_PATTERN.test(value)
    ? value
    : undefined;

export const toRoutineChangeRequestListItem = (
  request: RoutineChangeRequestResponse,
  now: Date = new Date(),
): RoutineChangeRequestListItem => ({
  id: request.id,
  routineName: request.routineName,
  requesterNickname: request.requesterNickname,
  requestedLabel: `${formatShortDate(request.requestedAt)} 요청`,
  requestedDetailLabel: formatDetailedDate(request.requestedAt),
  expiresLabel: `${formatShortDate(request.expiresAt)}까지`,
  expiresDetailLabel: `${formatDetailedDate(request.expiresAt)}까지`,
  dDayLabel: formatDday(request.expiresAt, now),
  changes: request.changes.map((change) => ({
    field: change.field,
    label: change.label,
    before: formatChangeValue(change.field, change.before),
    after: formatChangeValue(change.field, change.after),
    beforeColor: getSymbolColor(change.field, change.before),
    afterColor: getSymbolColor(change.field, change.after),
  })),
});

const mixWithWhite = (hexColor: string, whiteRatio: number) => {
  const match = /^#([\dA-Fa-f]{2})([\dA-Fa-f]{2})([\dA-Fa-f]{2})$/.exec(
    hexColor,
  );

  if (!match) return hexColor;

  const mixChannel = (channel: string) =>
    Math.round(
      Number.parseInt(channel, 16) * (1 - whiteRatio) + 255 * whiteRatio,
    );

  return `rgb(${mixChannel(match[1])}, ${mixChannel(match[2])}, ${mixChannel(match[3])})`;
};

const RoutineChangeRequestRow = ({
  isExpanded,
  isResolving,
  onApprove,
  onReject,
  onToggle,
  request,
}: RoutineChangeRequestRowProps) => {
  const { theme } = useAppTheme();

  return (
    <ThemeView
      style={[
        styles.changeRequestItem,
        isExpanded && styles.expandedChangeRequestItem,
      ]}
    >
      <Pressable
        accessibilityLabel={`${request.routineName} 변경 요청 ${isExpanded ? '접기' : '펼치기'}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => onToggle(request.id)}
        style={({ pressed }) => [
          styles.changeRequestSummary,
          pressed && styles.itemPressed,
        ]}
      >
        <ThemeView
          style={[
            styles.changeRequestIcon,
            isExpanded && styles.activeChangeRequestIcon,
          ]}
        >
          <Ionicons
            color={
              isExpanded
                ? theme.colors.action.primary.default
                : theme.colors.brand.text
            }
            name="document-text-outline"
            size={baseFoundation.iconSize.m}
          />
        </ThemeView>
        <ThemeView style={styles.changeRequestTextGroup} transparent>
          <Typography
            variant="body1"
            weight="semibold"
            style={styles.changeRequestTitle}
          >
            {request.routineName}
          </Typography>
          <Typography variant="caption1" style={styles.changeRequestMeta}>
            {request.requesterNickname} · 변경 {request.changes.length}건 ·{' '}
            {request.requestedLabel}
          </Typography>
        </ThemeView>
        <ThemeView style={styles.changeRequestDeadline} transparent>
          <Typography variant="body2" weight="semibold" style={styles.dDayText}>
            {request.dDayLabel}
          </Typography>
          <Typography variant="caption1" style={styles.expiresText}>
            · {request.expiresLabel}
          </Typography>
        </ThemeView>
        <Ionicons
          color={theme.colors.text.secondary}
          name={isExpanded ? 'chevron-up' : 'chevron-forward'}
          size={baseFoundation.iconSize.m}
        />
      </Pressable>

      {isExpanded ? (
        <ThemeView style={styles.changeRequestDetails}>
          <Typography
            variant="body2"
            weight="semibold"
            style={styles.changeDetailsTitle}
          >
            변경 내용
          </Typography>
          <ThemeView style={styles.changeRows} transparent>
            {request.changes.map((change) => (
              <ThemeView
                key={change.field}
                style={styles.changeRow}
                testID="routine-change-row"
                transparent
              >
                <Typography variant="caption1" style={styles.changeLabel}>
                  {change.label}
                </Typography>
                <ThemeView style={styles.beforeValue}>
                  {change.beforeColor ? (
                    <ThemeView
                      accessibilityLabel="변경 전 루틴 컬러"
                      accessibilityRole="image"
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: change.beforeColor },
                      ]}
                      testID="routine-change-before-color"
                    />
                  ) : (
                    <Typography
                      variant="caption1"
                      style={styles.beforeValueText}
                    >
                      {change.before}
                    </Typography>
                  )}
                </ThemeView>
                <Ionicons
                  color={theme.colors.text.tertiary}
                  name="arrow-forward"
                  size={baseFoundation.iconSize.m}
                />
                <ThemeView style={styles.afterValue}>
                  {change.afterColor ? (
                    <ThemeView
                      accessibilityLabel="변경 후 루틴 컬러"
                      accessibilityRole="image"
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: change.afterColor },
                      ]}
                      testID="routine-change-after-color"
                    />
                  ) : (
                    <Typography
                      variant="caption1"
                      weight="semibold"
                      style={styles.afterValueText}
                    >
                      {change.after}
                    </Typography>
                  )}
                </ThemeView>
              </ThemeView>
            ))}
          </ThemeView>
          <ThemeView style={styles.changeRequestDates} transparent>
            <ThemeView style={styles.changeRequestDateRow} transparent>
              <Typography variant="caption1" style={styles.dateLabel}>
                요청일
              </Typography>
              <Typography variant="caption1" style={styles.dateValue}>
                {request.requestedDetailLabel}
              </Typography>
            </ThemeView>
            <ThemeView style={styles.changeRequestDateRow} transparent>
              <Typography variant="caption1" style={styles.dateLabel}>
                만료일
              </Typography>
              <ThemeView style={styles.dateValueGroup} transparent>
                <Typography
                  variant="caption1"
                  weight="semibold"
                  style={styles.dDayText}
                >
                  {request.dDayLabel}
                </Typography>
                <Typography variant="caption1" style={styles.dateValue}>
                  · {request.expiresDetailLabel}
                </Typography>
              </ThemeView>
            </ThemeView>
          </ThemeView>
          <ThemeView style={styles.changeRequestActions} transparent>
            <Pressable
              accessibilityLabel="거절"
              accessibilityRole="button"
              accessibilityState={{ disabled: isResolving }}
              disabled={isResolving}
              onPress={() => onReject(request.id)}
              style={({ pressed }) => [
                styles.rejectButton,
                pressed && styles.itemPressed,
                isResolving && styles.actionDisabled,
              ]}
            >
              <Typography
                variant="body2"
                weight="semibold"
                style={styles.rejectButtonText}
              >
                거절
              </Typography>
            </Pressable>
            <Pressable
              accessibilityLabel="승인"
              accessibilityRole="button"
              accessibilityState={{ disabled: isResolving }}
              disabled={isResolving}
              onPress={() => onApprove(request.id)}
              style={({ pressed }) => [
                styles.approveButton,
                pressed && styles.itemPressed,
                isResolving && styles.actionDisabled,
              ]}
            >
              <Typography
                variant="body2"
                weight="semibold"
                style={styles.approveButtonText}
              >
                승인
              </Typography>
            </Pressable>
          </ThemeView>
        </ThemeView>
      ) : null}
    </ThemeView>
  );
};

export default RoutineChangeRequestRow;

const styles = StyleSheet.create((theme) => ({
  itemPressed: {
    opacity: baseFoundation.opacity.medium,
  },

  actionDisabled: {
    opacity: baseFoundation.opacity.disabled,
  },

  changeRequestItem: {
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: mixWithWhite(theme.colors.action.primary.default, 0.84),
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.99),
  },

  expandedChangeRequestItem: {
    paddingBottom: baseFoundation.spacing[3],
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.93),
  },

  changeRequestSummary: {
    minHeight: baseFoundation.dimension.x72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: baseFoundation.spacing[4],
    gap: baseFoundation.spacing[3],
  },

  changeRequestIcon: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.radii.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.92),
  },

  activeChangeRequestIcon: {
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.84),
  },

  changeRequestTextGroup: {
    minWidth: baseFoundation.dimension.x0,
    flex: 1,
  },

  changeRequestTitle: {
    color: theme.colors.brand.text,
  },

  changeRequestMeta: {
    marginTop: baseFoundation.spacing[1],
    color: theme.colors.text.secondary,
  },

  changeRequestDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dDayText: {
    color: theme.colors.feedback.error.text,
  },

  expiresText: {
    color: theme.colors.text.secondary,
  },

  changeRequestDetails: {
    marginHorizontal: baseFoundation.spacing[4],
    borderRadius: baseFoundation.radii.m,
    padding: baseFoundation.spacing[3],
    backgroundColor: theme.colors.field.background,
  },

  changeDetailsTitle: {
    color: theme.colors.brand.text,
  },

  changeRows: {
    marginTop: baseFoundation.spacing[2],
  },

  changeRow: {
    minHeight: baseFoundation.dimension.x58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: mixWithWhite(theme.colors.action.primary.default, 0.86),
  },

  changeLabel: {
    width: baseFoundation.dimension.x80,
    color: theme.colors.brand.text,
  },

  beforeValue: {
    minHeight: baseFoundation.dimension.x40,
    minWidth: baseFoundation.dimension.x0,
    flex: 1,
    borderRadius: baseFoundation.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[2],
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.97),
  },

  beforeValueText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },

  afterValue: {
    minHeight: baseFoundation.dimension.x40,
    minWidth: baseFoundation.dimension.x0,
    flex: 1,
    borderRadius: baseFoundation.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[2],
    backgroundColor: mixWithWhite(theme.colors.action.primary.default, 0.91),
  },

  afterValueText: {
    color: theme.colors.action.primary.default,
    textAlign: 'center',
  },

  colorSwatch: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderWidth: baseFoundation.dimension.x1,
    borderColor: theme.colors.text.tertiary,
    borderRadius: baseFoundation.radii.round,
  },

  changeRequestDates: {
    paddingTop: baseFoundation.spacing[3],
    gap: baseFoundation.spacing[2],
  },

  changeRequestDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateLabel: {
    color: theme.colors.text.secondary,
  },

  dateValue: {
    color: theme.colors.text.secondary,
  },

  dateValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeRequestActions: {
    marginTop: baseFoundation.spacing[3],
    flexDirection: 'row',
    gap: baseFoundation.spacing[3],
  },

  rejectButton: {
    minHeight: baseFoundation.dimension.x44,
    flex: 1,
    borderWidth: baseFoundation.dimension.x1,
    borderColor: theme.colors.action.primary.default,
    borderRadius: baseFoundation.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.field.background,
  },

  rejectButtonText: {
    color: theme.colors.action.primary.default,
  },

  approveButton: {
    minHeight: baseFoundation.dimension.x44,
    flex: 1,
    borderRadius: baseFoundation.radii.s,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.action.primary.default,
  },

  approveButtonText: {
    color: theme.colors.action.primary.label,
  },
}));
