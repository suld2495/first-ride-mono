import { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeView from './ThemeView';
import { Typography } from './Typography';

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
   * 도움말 텍스트 (에러 메시지 등)
   */
  helperText?: string;

  /**
   * 비활성화 상태
   */
  disabled?: boolean;

  /**
   * 컨테이너 스타일
   */
  containerStyle?: ViewStyle;

  /**
   * 드롭다운 최대 높이
   */
  dropdownMaxHeight?: number;
}

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
  helperText,
  disabled = false,
  containerStyle,
  dropdownMaxHeight = 250,
}: SelectProps<T>) {
  const { theme } = useUnistyles();
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = items.find((item) => item.value === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectItem = (item: SelectItem<T>) => {
    onSelect(item.value);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          error && styles.selectButtonError,
          disabled && styles.selectButtonDisabled,
          isOpen && styles.selectButtonFocused,
        ]}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Typography
          style={[
            styles.selectText,
            !selectedItem && styles.selectPlaceholder,
            disabled && styles.selectTextDisabled,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Typography>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={
            disabled ? theme.colors.text.disabled : theme.colors.text.secondary
          }
        />
      </TouchableOpacity>

      {/* Helper Text */}
      {helperText && (
        <Typography
          variant="caption"
          style={[styles.helperText, error && styles.helperTextError]}
        >
          {helperText}
        </Typography>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <ThemeView
          style={[
            styles.dropdown,
            {
              maxHeight: dropdownMaxHeight,
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={`${item.value}-${index}`}
                style={[
                  styles.dropdownItem,
                  item.value === value && styles.dropdownItemSelected,
                ]}
                onPress={() => handleSelectItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownItemContent}>
                  <Typography
                    style={[
                      styles.dropdownItemLabel,
                      item.value === value && styles.dropdownItemLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="caption"
                      style={styles.dropdownItemDescription}
                    >
                      {item.description}
                    </Typography>
                  )}
                </View>
                {item.value === value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.action.primary.default}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemeView>
      )}
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
    minHeight: 48,
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.s,
    backgroundColor: theme.colors.background.surface,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.foundation.radii.m,
  },

  selectButtonFocused: {
    borderColor: theme.colors.border.focus,
    borderWidth: 2,
  },

  selectButtonError: {
    borderColor: theme.colors.feedback.error.border,
  },

  selectButtonDisabled: {
    backgroundColor: theme.colors.background.sunken,
    opacity: theme.foundation.opacity.disabled,
  },

  selectText: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.foundation.typography.size.m,
  },

  selectPlaceholder: {
    color: theme.colors.text.tertiary,
  },

  selectTextDisabled: {
    color: theme.colors.text.tertiary,
  },

  helperText: {
    marginTop: theme.foundation.spacing.xs,
    marginLeft: theme.foundation.spacing.s,
    color: theme.colors.text.secondary,
  },

  helperTextError: {
    color: theme.colors.feedback.error.text,
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.foundation.spacing.xs,
    borderRadius: theme.foundation.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    ...theme.foundation.shadow.m,
    zIndex: 1001,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },

  dropdownItemSelected: {
    backgroundColor: theme.colors.action.secondary.default,
  },

  dropdownItemContent: {
    flex: 1,
    gap: theme.foundation.spacing.xs,
  },

  dropdownItemLabel: {
    color: theme.colors.text.primary,
    fontSize: theme.foundation.typography.size.m,
  },

  dropdownItemLabelSelected: {
    color: theme.colors.action.secondary.label,
    fontWeight: theme.foundation.typography.weight.semibold,
  },

  dropdownItemDescription: {
    color: theme.colors.text.secondary,
  },
}));

export default Select;
