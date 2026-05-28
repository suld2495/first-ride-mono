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
  iconColor: string;
  onToggle: () => void;
  onEdit: () => void;
  onHide: () => void;
  onPause: () => void;
  onRequest: () => void;
  onDelete: () => void;
  showsRequestItem: boolean;
};

type RoutineContextMenuTriggerProps = Pick<
  RoutineContextMenuProps,
  'routineName' | 'iconColor' | 'onToggle'
>;

type RoutineContextMenuPanelProps = Pick<
  RoutineContextMenuProps,
  | 'routineId'
  | 'isHidden'
  | 'onEdit'
  | 'onHide'
  | 'onPause'
  | 'onRequest'
  | 'onDelete'
  | 'showsRequestItem'
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
}: RoutineContextMenuTriggerProps) => (
  <Pressable
    onPress={onToggle}
    style={styles.trigger}
    accessibilityRole="button"
    accessibilityLabel={`${routineName} 메뉴 열기`}
  >
    <View style={styles.triggerIconAnchor}>
      <RoutineRequestIcon color={iconColor} />
    </View>
  </Pressable>
);

export const RoutineContextMenuPanel = ({
  routineId,
  isHidden,
  onEdit,
  onHide,
  onPause,
  onRequest,
  onDelete,
  showsRequestItem,
  style,
}: RoutineContextMenuPanelProps) => {
  const items: RoutineContextMenuItem[] = [
    ...(showsRequestItem ? [{ label: '인증요청', onPress: onRequest }] : []),
    { label: '수정', onPress: onEdit },
    { label: isHidden ? '보이기' : '숨김', onPress: onHide },
    { label: '일시정지', onPress: onPause },
    { label: '삭제', onPress: onDelete, color: palette.theme.red[50] },
  ];

  const renderMenuItem = ({ label, onPress, color }: RoutineContextMenuItem) => (
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
  iconColor,
  onToggle,
  onEdit,
  onHide,
  onPause,
  onRequest,
  onDelete,
  showsRequestItem,
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
        onEdit={onEdit}
        onHide={onHide}
        onPause={onPause}
        onRequest={onRequest}
        onDelete={onDelete}
        showsRequestItem={showsRequestItem}
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
    height: baseFoundation.dimension.x44,
    justifyContent: 'center',
    alignItems: 'flex-end',
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
