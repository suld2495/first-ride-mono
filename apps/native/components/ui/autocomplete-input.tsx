import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation, palette } from '@/theme/tokens';

import { Input, type InputProps } from './input';
import ThemeView from './theme-view';
import { Typography } from './typography';

export interface AutocompleteItem {
  label: string;
  value: string;
}

export interface AutocompleteInputProps
  extends Omit<InputProps, 'onChangeText'> {
  /**
   * 자동완성 항목 목록
   */
  items?: AutocompleteItem[];

  /**
   * 로딩 상태
   */
  loading?: boolean;

  /**
   * 텍스트 변경 핸들러
   */
  onChangeText?: (text: string) => void;

  /**
   * 항목 선택 핸들러
   */
  onSelectItem?: (item: AutocompleteItem) => void;

  /**
   * 드롭다운을 표시할지 여부
   */
  showDropdown?: boolean;

  /**
   * 드롭다운 최대 높이
   */
  dropdownMaxHeight?: number;

  /**
   * 빈 상태 메시지
   */
  emptyMessage?: string;

  /**
   * 컨테이너 스타일
   */
  containerStyle?: ViewStyle;
}

/**
 * AutocompleteInput 컴포넌트
 *
 * 텍스트 입력에 따라 자동완성 드롭다운을 표시하는 Input 컴포넌트
 *
 * @example
 * <AutocompleteInput
 *   value={value}
 *   onChangeText={setValue}
 *   items={suggestions}
 *   onSelectItem={(item) => setValue(item.value)}
 *   placeholder="검색..."
 * />
 */
export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  items = [],
  loading = false,
  onChangeText,
  onSelectItem,
  showDropdown = true,
  dropdownMaxHeight = 200,
  emptyMessage = '검색 결과가 없습니다.',
  containerStyle,
  value,
  ...inputProps
}) => {
  const { theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const dropdownColors = useMemo(() => {
    const isDark = theme.name === 'dark';

    return {
      background: isDark
        ? theme.colors.background.surface
        : (theme.colors.background.input ?? theme.colors.background.surface),
      divider: palette.gray[200],
      text: isDark
        ? theme.colors.text.primary
        : (theme.colors.text.input ?? theme.colors.text.primary),
    };
  }, [theme]);

  const shouldShowDropdown =
    isFocused && showDropdown && (items.length > 0 || loading);

  const handleSelectItem = useCallback(
    (item: AutocompleteItem): void => {
      onSelectItem?.(item);
      setIsFocused(false);
    },
    [onSelectItem],
  );

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<InputProps['onFocus']>>[0]): void => {
      setIsFocused(true);
      inputProps.onFocus?.(e);
    },
    [inputProps],
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<InputProps['onBlur']>>[0]): void => {
      // Delay blur to allow item selection
      setTimeout(() => {
        setIsFocused(false);
      }, 200);
      inputProps.onBlur?.(e);
    },
    [inputProps],
  );

  const renderDropdownContent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Typography
            variant="caption"
            color={dropdownColors.text}
            style={styles.emptyText}
          >
            검색 중...
          </Typography>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography
            variant="caption"
            color={dropdownColors.text}
            style={styles.emptyText}
          >
            {emptyMessage}
          </Typography>
        </View>
      );
    }

    return items.map((item, index) => {
      const isFirstItem = index === 0;
      const isLastItem = index === items.length - 1;

      return (
        <TouchableOpacity
          key={item.value}
          testID="autocomplete-option"
          style={[
            styles.dropdownItem,
            {
              backgroundColor: dropdownColors.background,
              borderBottomWidth: isLastItem ? 0 : 1,
              borderBottomColor: dropdownColors.divider,
              borderTopLeftRadius: isFirstItem
                ? baseFoundation.dimension.x8
                : 0,
              borderTopRightRadius: isFirstItem
                ? baseFoundation.dimension.x8
                : 0,
              borderBottomLeftRadius: isLastItem
                ? baseFoundation.dimension.x8
                : 0,
              borderBottomRightRadius: isLastItem
                ? baseFoundation.dimension.x8
                : 0,
            },
          ]}
          onPress={() => handleSelectItem(item)}
        >
          <Typography color={dropdownColors.text}>{item.label}</Typography>
        </TouchableOpacity>
      );
    });
  }, [loading, items, emptyMessage, dropdownColors, handleSelectItem]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Input
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {shouldShowDropdown && (
        <ThemeView
          testID="autocomplete-dropdown"
          style={[
            styles.dropdown,
            {
              maxHeight: dropdownMaxHeight,
              backgroundColor: dropdownColors.background,
              shadowColor: '#000000',
            },
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {renderDropdownContent()}
          </ScrollView>
        </ThemeView>
      )}
    </View>
  );
};

export default AutocompleteInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
    marginTop: baseFoundation.spacing[1],
    borderRadius: baseFoundation.dimension.x8,
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[3],
  },
  emptyContainer: {
    paddingVertical: baseFoundation.spacing[4],
    paddingHorizontal: baseFoundation.spacing[4],
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
