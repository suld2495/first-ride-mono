import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  type LayoutChangeEvent,
  type LayoutRectangle,
  Modal,
  Pressable,
  ScrollView,
  type StyleProp,
  Text,
  type TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  type ViewStyle,
} from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import type { InputSize, InputVariant } from './input';
import ThemeView from './theme-view';
import { Typography } from './typography';

export interface SelectItem<T = string | number> {
  label: string;
  value: T;
  description?: string;
}

export interface SelectProps<T = string | number> {
  /**
   * 선택된 값
   */
  value?: T;

  /**
   * 선택 가능한 항목 목록
   */
  items: SelectItem<T>[];

  /**
   * 항목 선택 핸들러
   */
  onSelect: (value: T) => void;

  /**
   * placeholder 텍스트
   */
  placeholder?: string;

  /**
   * 에러 상태
   */
  error?: boolean;

  /**
   * 성공 상태
   */
  success?: boolean;

  /**
   * 도움말 텍스트 (에러 메시지 등)
   */
  helperText?: string;

  /**
   * 비활성화 상태
   */
  disabled?: boolean;

  /**
   * Input과 동일한 크기 옵션
   */
  size?: InputSize;

  /**
   * Input과 동일한 스타일 옵션
   */
  variant?: InputVariant;

  /**
   * 전체 너비
   */
  fullWidth?: boolean;

  /**
   * 라벨 텍스트
   */
  label?: string;

  /**
   * 커스텀 스타일 (필드 버튼)
   */
  style?: StyleProp<ViewStyle>;

  /**
   * 선택 텍스트 커스텀 스타일
   */
  textStyle?: StyleProp<TextStyle>;

  /**
   * placeholder 텍스트 색상
   */
  placeholderTextColor?: string;

  /**
   * 컨테이너 스타일
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * 드롭다운 최대 높이
   */
  dropdownMaxHeight?: number;
}

const DROPDOWN_ITEM_HEIGHT = 44;

/**
 * Select 컴포넌트
 *
 * 드롭다운 선택 UI를 제공하는 컴포넌트
 * 디자인 시스템을 준수하여 구현됨
 *
 * @example
 * <Select
 *   value={selectedValue}
 *   items={[
 *     { label: '옵션 1', value: '1', description: '설명 1' },
 *     { label: '옵션 2', value: '2', description: '설명 2' },
 *   ]}
 *   onSelect={(value) => setSelectedValue(value)}
 *   placeholder="옵션을 선택하세요"
 * />
 */
export function Select<T = string | number>({
  value,
  items = [],
  onSelect,
  placeholder = '선택하세요',
  error = false,
  success = false,
  helperText,
  disabled = false,
  size = 'md',
  variant = 'outlined',
  fullWidth = false,
  label,
  style,
  textStyle,
  placeholderTextColor,
  containerStyle,
  dropdownMaxHeight = 250,
}: SelectProps<T>) {
  const { theme } = useAppTheme();
  const isTestEnv = process.env.NODE_ENV === 'test';
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState<LayoutRectangle | null>(
    null,
  );
  const buttonRef = useRef<View>(null);

  const selectedItem = items.find((item) => item.value === value);
  const state = error ? 'error' : success ? 'success' : 'default';
  const sizeButtonStyle = {
    xs: styles.selectButtonXs,
    sm: styles.selectButtonSm,
    md: styles.selectButtonMd,
    lg: styles.selectButtonLg,
  }[size];
  const sizeTextStyle = {
    xs: styles.selectTextXs,
    sm: styles.selectTextSm,
    md: styles.selectTextMd,
    lg: styles.selectTextLg,
  }[size];
  const variantStyle = {
    outlined: styles.variantOutlined,
    filled: styles.variantFilled,
    underlined: styles.variantUnderlined,
    ghost: styles.variantGhost,
  }[variant];
  const stateStyle = {
    default: null,
    error: styles.selectButtonError,
    success: styles.selectButtonSuccess,
  }[state];
  const helperStyle = {
    default: styles.helperDefault,
    error: styles.helperTextError,
    success: styles.helperSuccess,
  }[state];
  const windowHeight = Dimensions.get('window').height;
  const dropdownHeight = Math.min(
    dropdownMaxHeight,
    items.length * DROPDOWN_ITEM_HEIGHT,
  );

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openDropdown = useCallback(() => {
    if (isTestEnv) {
      setIsOpen(true);

      return;
    }

    if (buttonRef.current?.measureInWindow) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setIsOpen(true);
      });

      return;
    }

    setIsOpen(true);
  }, [isTestEnv]);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    if (isOpen) {
      closeDropdown();

      return;
    }

    openDropdown();
  }, [closeDropdown, disabled, isOpen, openDropdown]);

  const handleButtonLayout = useCallback((event: LayoutChangeEvent) => {
    setButtonLayout(event.nativeEvent.layout);
  }, []);

  const handleSelectItem = useCallback(
    (item: SelectItem<T>) => {
      onSelect(item.value);
      closeDropdown();
    },
    [closeDropdown, onSelect],
  );

  const renderDropdownItem = useCallback(
    (item: SelectItem<T>) => (
      <TouchableOpacity
        key={String(item.value)}
        style={[
          styles.dropdownItem,
          item.value === value && styles.dropdownItemSelected,
        ]}
        onPress={() => handleSelectItem(item)}
        activeOpacity={0.7}
        delayPressIn={80}
        rejectResponderTermination={false}
      >
        <View style={styles.dropdownItemContent}>
          <Text
            style={[
              styles.dropdownItemLabel,
              sizeTextStyle,
              item.value === value && styles.dropdownItemLabelSelected,
              textStyle,
            ]}
          >
            {item.label}
          </Text>
          {item.description && (
            <Text style={styles.dropdownItemDescription}>
              {item.description}
            </Text>
          )}
        </View>
        {item.value === value && (
          <Ionicons
            name="checkmark"
            size={baseFoundation.iconSize.m}
            color={theme.colors.field.icon}
          />
        )}
      </TouchableOpacity>
    ),
    [
      handleSelectItem,
      sizeTextStyle,
      textStyle,
      theme.colors.field.icon,
      value,
    ],
  );

  const dropdownTop = buttonLayout
    ? Math.min(
        buttonLayout.y + buttonLayout.height + theme.foundation.spacing[1],
        windowHeight - dropdownHeight - theme.foundation.spacing[6],
      )
    : 0;

  const dropdownContent = (
    <ThemeView
      testID="select-dropdown"
      style={[
        styles.dropdown,
        { height: dropdownHeight },
        isTestEnv
          ? styles.dropdownInline
          : {
              top: dropdownTop,
              left: buttonLayout?.x ?? 0,
              width: buttonLayout?.width ?? '100%',
            },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {items.map(renderDropdownItem)}
      </ScrollView>
    </ThemeView>
  );

  return (
    <View
      style={[
        styles.container,
        fullWidth && internalStyles.fullWidth,
        containerStyle,
      ]}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      {/* Select Button */}
      <TouchableOpacity
        ref={buttonRef}
        accessibilityRole="button"
        style={[
          styles.selectButton,
          sizeButtonStyle,
          variantStyle,
          stateStyle,
          disabled && styles.selectButtonDisabled,
          isOpen && styles.selectButtonFocused,
          style,
        ]}
        onPress={handleToggle}
        onLayout={handleButtonLayout}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            sizeTextStyle,
            !selectedItem && styles.selectPlaceholder,
            disabled && styles.selectTextDisabled,
            !selectedItem && placeholderTextColor
              ? { color: placeholderTextColor }
              : null,
            textStyle,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={baseFoundation.iconSize.m}
          color={
            disabled ? theme.colors.text.disabled : theme.colors.field.icon
          }
        />
      </TouchableOpacity>

      {/* Helper Text */}
      {helperText && (
        <Typography variant="caption" style={[styles.helperText, helperStyle]}>
          {helperText}
        </Typography>
      )}

      {/* Dropdown */}
      {isOpen &&
        !disabled &&
        (isTestEnv ? (
          dropdownContent
        ) : (
          <Modal
            transparent
            animationType="fade"
            visible={isOpen}
            onRequestClose={closeDropdown}
          >
            <Pressable style={styles.backdrop} onPress={closeDropdown} />
            <TouchableWithoutFeedback>
              {dropdownContent}
            </TouchableWithoutFeedback>
          </Modal>
        ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    zIndex: 1000,
  },

  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectButtonXs: {
    height: baseFoundation.dimension.x28,
    paddingHorizontal: baseFoundation.spacing[1],
  },

  selectButtonSm: {
    height: baseFoundation.dimension.x36,
    paddingHorizontal: baseFoundation.spacing[2],
  },

  selectButtonMd: {
    height: baseFoundation.dimension.x44,
    paddingHorizontal: baseFoundation.spacing[3],
  },

  selectButtonLg: {
    height: baseFoundation.dimension.x56,
    paddingHorizontal: baseFoundation.spacing[4],
  },

  variantOutlined: {
    borderWidth: 1,
    borderColor: theme.colors.field.border,
    backgroundColor: theme.colors.field.background,
    borderRadius: baseFoundation.radii.xs,
  },

  variantFilled: {
    borderWidth: 0,
    backgroundColor: theme.colors.field.background,
    borderRadius: baseFoundation.radii.xs,
  },

  variantUnderlined: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: 'transparent',
  },

  variantGhost: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },

  selectButtonFocused: {},

  selectButtonError: {
    borderColor: theme.colors.feedback.error.border,
  },

  selectButtonSuccess: {
    borderColor: theme.colors.feedback.success.border,
  },

  selectButtonDisabled: {
    backgroundColor: theme.colors.background.sunken,
    opacity: theme.foundation.opacity.disabled,
  },

  selectText: {
    flex: 1,
    color: theme.colors.field.text,
  },

  selectTextXs: {
    fontSize: theme.foundation.typography.size.s,
  },

  selectTextSm: {
    fontSize: theme.foundation.typography.size.m,
  },

  selectTextMd: {
    fontSize: theme.foundation.typography.size.m,
  },

  selectTextLg: {
    fontSize: theme.foundation.typography.size.xl,
  },

  selectPlaceholder: {
    color: theme.colors.field.placeholder,
  },

  selectTextDisabled: {
    color: theme.colors.text.tertiary,
  },

  helperText: {
    marginTop: theme.foundation.spacing[1],
    fontSize: theme.foundation.typography.size.s,
  },

  helperDefault: {
    color: theme.colors.field.label,
  },

  helperTextError: {
    color: theme.colors.feedback.error.text,
  },

  helperSuccess: {
    color: theme.colors.feedback.success.text,
  },

  label: {
    fontSize: theme.foundation.typography.size.m,
    fontWeight: '600',
    marginBottom: baseFoundation.spacing[1],
    marginLeft: baseFoundation.spacing[1],
    color: theme.colors.text.secondary,
  },

  dropdown: {
    position: 'absolute',
    borderRadius: baseFoundation.radii.xs,
    borderWidth: 0,
    backgroundColor: theme.colors.field.background,
    zIndex: 1002,
    overflow: 'hidden',
  },

  dropdownInline: {
    top: '100%',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    marginTop: theme.foundation.spacing[1],
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1001,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: DROPDOWN_ITEM_HEIGHT,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[1],
    borderWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: theme.colors.field.background,
  },

  dropdownItemSelected: {
    backgroundColor: theme.colors.field.background,
  },

  dropdownItemContent: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },

  dropdownItemLabel: {
    color: theme.colors.field.text,
  },

  dropdownItemLabelSelected: {
    color: theme.colors.field.text,
    fontWeight: theme.foundation.typography.weight.semibold,
  },

  dropdownItemDescription: {
    color: theme.colors.text.secondary,
  },
}));

const internalStyles = {
  fullWidth: {
    width: '100%' as const,
  },
};

export default Select;
