/* eslint-disable local-rules/no-multiple-components-in-file */
import { Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { RoutineRequestIcon } from '@/components/icons/routine-icons';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

const ROUTINE_CONTEXT_MENU_TRIGGER_WIDTH = baseFoundation.dimension.x12;
const ROUTINE_CONTEXT_MENU_TRIGGER_HIT_WIDTH = baseFoundation.dimension.x32;
const ROUTINE_CONTEXT_MENU_TRIGGER_HIT_HEIGHT = baseFoundation.dimension.x56;

type RoutineContextMenuProps = {
  routineId: number;
  routineName: string;
  isOpen: boolean;
  isHidden: boolean;
  isPaused: boolean;
  iconColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onHide: () => void;
  onPause: () => void;
  onRequest: () => void;
  onDelete: () => void;
  showsRequestItem: boolean;
  showsStatusItems?: boolean;
};

type RoutineContextMenuTriggerProps = Pick<
  RoutineContextMenuProps,
  'routineName' | 'iconColor' | 'onToggle'
> & {
  iconAnchorStyle?: StyleProp<ViewStyle>;
  inline?: boolean;
  style?: StyleProp<ViewStyle>;
};

type RoutineContextMenuPanelProps = Pick<
  RoutineContextMenuProps,
  | 'routineId'
  | 'isHidden'
  | 'isPaused'
  | 'onEdit'
  | 'onHide'
  | 'onPause'
  | 'onRequest'
  | 'onDelete'
  | 'showsRequestItem'
  | 'showsStatusItems'
> & {
  style?: StyleProp<ViewStyle>;
};

type RoutineContextMenuItem = {
  label: string;
  onPress: () => void;
  color?: string;
};

export const RoutineContextMenuTrigger = ({
  routineName,
  iconColor,
  onToggle,
  iconAnchorStyle,
  inline = false,
  style,
}: RoutineContextMenuTriggerProps) => (
  <Pressable
    onPress={onToggle}
    style={[inline ? styles.inlineTrigger : styles.trigger, style]}
    hitSlop={inline ? baseFoundation.spacing[1.5] : undefined}
    accessibilityRole="button"
    accessibilityLabel={`${routineName} 메뉴 열기`}
  >
    <View
      style={[
        inline ? styles.inlineTriggerIconAnchor : styles.triggerIconAnchor,
        iconAnchorStyle,
      ]}
    >
      <RoutineRequestIcon color={iconColor} />
    </View>
  </Pressable>
);

export const RoutineContextMenuPanel = ({
  routineId,
  isHidden,
  isPaused,
  onEdit,
  onHide,
  onPause,
  onRequest,
  onDelete,
  showsRequestItem,
  showsStatusItems = true,
  style,
}: RoutineContextMenuPanelProps) => {
  const items: RoutineContextMenuItem[] = [
    ...(showsRequestItem ? [{ label: '인증요청', onPress: onRequest }] : []),
    { label: '수정', onPress: onEdit },
    ...(showsStatusItems
      ? [
          { label: isHidden ? '공개' : '비공개', onPress: onHide },
          { label: isPaused ? '시작' : '일시정지', onPress: onPause },
        ]
      : []),
    { label: '삭제', onPress: onDelete, color: palette.theme.red[50] },
  ];

  const renderMenuItem = ({
    label,
    onPress,
    color,
  }: RoutineContextMenuItem) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.menuItem}
      testID="routine-context-menu-item"
    >
      <Typography
        variant="body3"
        weight="regular"
        color={color ?? palette.theme.gray[50]}
        testID="routine-context-menu-item-text"
      >
        {label}
      </Typography>
    </Pressable>
  );

  return (
    <View
      style={[styles.menu, style]}
      testID={`routine-context-menu-${routineId}`}
    >
      {items.map(renderMenuItem)}
    </View>
  );
};

const RoutineContextMenu = ({
  routineId,
  routineName,
  isOpen,
  isHidden,
  isPaused,
  iconColor,
  onToggle,
  onEdit,
  onHide,
  onPause,
  onRequest,
  onDelete,
  showsRequestItem,
  showsStatusItems,
}: RoutineContextMenuProps) => (
  <>
    <RoutineContextMenuTrigger
      routineName={routineName}
      iconColor={iconColor}
      onToggle={onToggle}
    />
    {isOpen ? (
      <RoutineContextMenuPanel
        routineId={routineId}
        isHidden={isHidden}
        isPaused={isPaused}
        onEdit={onEdit}
        onHide={onHide}
        onPause={onPause}
        onRequest={onRequest}
        onDelete={onDelete}
        showsRequestItem={showsRequestItem}
        showsStatusItems={showsStatusItems}
      />
    ) : null}
  </>
);

const styles = StyleSheet.create({
  trigger: {
    position: 'absolute',
    right: baseFoundation.spacing[0],
    top: baseFoundation.spacing[0],
    width: ROUTINE_CONTEXT_MENU_TRIGGER_HIT_WIDTH,
    height: ROUTINE_CONTEXT_MENU_TRIGGER_HIT_HEIGHT,
    alignItems: 'flex-end',
  },
  triggerIconAnchor: {
    position: 'absolute',
    right: baseFoundation.spacing[4],
    top: baseFoundation.spacing[0],
    width: ROUTINE_CONTEXT_MENU_TRIGGER_WIDTH,
    height: baseFoundation.dimension.x18,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  inlineTrigger: {
    width: baseFoundation.dimension.x20,
    height: baseFoundation.dimension.x20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineTriggerIconAnchor: {
    width: baseFoundation.dimension.x12,
    height: baseFoundation.dimension.x20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: baseFoundation.spacing[10],
    width: 144,
    padding: baseFoundation.spacing[1.5],
    borderRadius: baseFoundation.radii.xs,
    borderWidth: 1,
    borderColor: palette.theme.gray[200],
    backgroundColor: '#FFFFFF',
    zIndex: baseFoundation.zIndex.popover,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  menuItem: {
    height: baseFoundation.dimension.x30,
    paddingLeft: baseFoundation.spacing[2],
    justifyContent: 'center',
  },
});

export default RoutineContextMenu;
