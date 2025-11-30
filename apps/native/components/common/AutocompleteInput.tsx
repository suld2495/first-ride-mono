import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

import { Input, type InputProps } from './Input';
import ThemeView from './ThemeView';
import { Typography } from './Typography';

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
  const colorScheme = useColorScheme();
  const [isFocused, setIsFocused] = useState(false);

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
          <Typography variant="caption" style={styles.emptyText}>
            검색 중...
          </Typography>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant="caption" style={styles.emptyText}>
            {emptyMessage}
          </Typography>
        </View>
      );
    }

    return items.map((item) => (
      <TouchableOpacity
        key={item.value}
        style={[
          styles.dropdownItem,
          {
            backgroundColor: colorScheme === 'dark' ? '#2c2c2c' : '#ffffff',
            borderBottomColor: colorScheme === 'dark' ? '#404040' : '#e0e0e0',
          },
        ]}
        onPress={() => handleSelectItem(item)}
      >
        <Typography>{item.label}</Typography>
      </TouchableOpacity>
    ));
  }, [loading, items, emptyMessage, colorScheme, handleSelectItem]);

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
          style={[
            styles.dropdown,
            {
              maxHeight: dropdownMaxHeight,
              shadowColor: colorScheme === 'dark' ? '#000000' : '#000000',
              borderColor: colorScheme === 'dark' ? '#404040' : '#e0e0e0',
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
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  emptyContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});
