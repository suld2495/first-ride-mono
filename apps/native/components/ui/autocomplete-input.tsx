import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type TextInput,
  type ViewStyle,
} from 'react-native';

import SelectedOptionCheckIcon from '@/components/icons/selected-option-check-icon';
import { useAppTheme } from '@/components/ui/tamagui';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '@/theme/tokens';

import { Input, type InputProps } from './input';
import ThemeView from './theme-view';
import { Typography } from './typography';

const DROPDOWN_ITEM_HEIGHT = baseFoundation.dimension.x48;
const DROPDOWN_EMPTY_HEIGHT = baseFoundation.dimension.x48;
const DROPDOWN_GAP = baseFoundation.spacing[1];

type DropdownPlacement = 'above' | 'below';

interface ResolveDropdownLayoutParams {
  anchorY: number;
  anchorHeight: number;
  dropdownHeight: number;
  dropdownMaxHeight: number;
  viewportBottom: number;
}

interface ResolvedDropdownLayout {
  placement: DropdownPlacement;
  maxHeight: number;
}

export const resolveAutocompleteDropdownLayout = ({
  anchorY,
  anchorHeight,
  dropdownHeight,
  dropdownMaxHeight,
  viewportBottom,
}: ResolveDropdownLayoutParams): ResolvedDropdownLayout => {
  const spaceBelow = Math.max(
    0,
    viewportBottom - (anchorY + anchorHeight) - DROPDOWN_GAP,
  );
  const spaceAbove = Math.max(0, anchorY - DROPDOWN_GAP);
  const placement: DropdownPlacement =
    dropdownHeight <= spaceBelow ? 'below' : 'above';
  const availableHeight = placement === 'below' ? spaceBelow : spaceAbove;

  return {
    placement,
    maxHeight: Math.min(dropdownMaxHeight, availableHeight),
  };
};

export interface AutocompleteItem {
  label: string;
  value: string;
  imageSource?: ImageSourcePropType;
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

export interface AutocompleteInputHandle {
  dismiss: () => void;
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
export const AutocompleteInput = forwardRef<
  AutocompleteInputHandle,
  AutocompleteInputProps
>(
  (
    {
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
    },
    ref,
  ) => {
    const { theme } = useAppTheme();
    const containerRef = useRef<View>(null);
    const textInputRef = useRef<TextInput>(null);
    const visibleViewportBottomRef = useRef<number | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [dropdownPlacement, setDropdownPlacement] =
      useState<DropdownPlacement>('below');
    const [availableDropdownHeight, setAvailableDropdownHeight] =
      useState(dropdownMaxHeight);
    const dropdownColors = useMemo(() => {
      const isDark = theme.name === 'dark';

      return {
        background: isDark
          ? theme.colors.background.surface
          : (theme.colors.background.input ?? theme.colors.background.surface),
        divider: palette.theme.gray[5],
        text: isDark
          ? theme.colors.text.primary
          : (theme.colors.text.input ?? theme.colors.text.primary),
      };
    }, [theme]);

    const shouldShowDropdown =
      isFocused && showDropdown && (items.length > 0 || loading);
    const dismissDropdown = useCallback(() => {
      textInputRef.current?.blur();
      setIsFocused(false);
      Keyboard.dismiss();
    }, []);
    const expectedDropdownHeight = useMemo(() => {
      if (loading || items.length === 0) {
        return Math.min(dropdownMaxHeight, DROPDOWN_EMPTY_HEIGHT);
      }

      return Math.min(dropdownMaxHeight, items.length * DROPDOWN_ITEM_HEIGHT);
    }, [dropdownMaxHeight, items.length, loading]);

    const updateDropdownPlacement = useCallback(
      (viewportBottom = visibleViewportBottomRef.current) => {
        containerRef.current?.measureInWindow((_, y, __, height) => {
          const resolvedViewportBottom =
            viewportBottom ?? Dimensions.get('window').height;
          const dropdownLayout = resolveAutocompleteDropdownLayout({
            anchorY: y,
            anchorHeight: height,
            dropdownHeight: expectedDropdownHeight,
            dropdownMaxHeight,
            viewportBottom: resolvedViewportBottom,
          });

          setDropdownPlacement(dropdownLayout.placement);
          setAvailableDropdownHeight(dropdownLayout.maxHeight);
        });
      },
      [dropdownMaxHeight, expectedDropdownHeight],
    );

    useImperativeHandle(
      ref,
      () => ({
        dismiss: dismissDropdown,
      }),
      [dismissDropdown],
    );

    const handleSelectItem = useCallback(
      (item: AutocompleteItem): void => {
        onSelectItem?.(item);
        dismissDropdown();
      },
      [dismissDropdown, onSelectItem],
    );

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<InputProps['onFocus']>>[0]): void => {
        setIsFocused(true);
        updateDropdownPlacement();
        inputProps.onFocus?.(e);
      },
      [inputProps, updateDropdownPlacement],
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

    useEffect(() => {
      if (isFocused) {
        updateDropdownPlacement();
      }
    }, [isFocused, updateDropdownPlacement]);

    useEffect(() => {
      const keyboardShowSubscription = Keyboard.addListener(
        'keyboardDidShow',
        (event) => {
          visibleViewportBottomRef.current = event.endCoordinates.screenY;

          if (isFocused) {
            updateDropdownPlacement(event.endCoordinates.screenY);
          }
        },
      );
      const keyboardHideSubscription = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          visibleViewportBottomRef.current = null;

          if (isFocused) {
            updateDropdownPlacement(Dimensions.get('window').height);
          }
        },
      );

      return () => {
        keyboardShowSubscription.remove();
        keyboardHideSubscription.remove();
      };
    }, [isFocused, updateDropdownPlacement]);

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
        const isSelected = item.value === value;

        return (
          <TouchableOpacity
            key={item.value}
            testID="autocomplete-option"
            accessibilityState={{ selected: isSelected }}
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
            <View
              testID={`autocomplete-option-content-${item.value}`}
              style={styles.dropdownItemContent}
            >
              <View style={styles.dropdownItemLabel}>
                {item.imageSource ? (
                  <View
                    testID={`autocomplete-option-avatar-${item.value}`}
                    style={styles.optionAvatar}
                  >
                    <Image
                      testID={`autocomplete-option-image-${item.value}`}
                      source={item.imageSource}
                      style={styles.optionImage}
                      resizeMode="contain"
                      accessibilityLabel={`${item.label} 캐릭터`}
                    />
                  </View>
                ) : null}
                <Typography color={dropdownColors.text} numberOfLines={1}>
                  {item.label}
                </Typography>
              </View>
              {isSelected ? (
                <SelectedOptionCheckIcon
                  testID={`autocomplete-selected-icon-${item.value}`}
                  color={theme.colors.field.icon}
                />
              ) : null}
            </View>
          </TouchableOpacity>
        );
      });
    }, [
      loading,
      items,
      emptyMessage,
      dropdownColors,
      handleSelectItem,
      theme.colors.field.icon,
      value,
    ]);

    return (
      <View
        ref={containerRef}
        style={[styles.container, containerStyle]}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <Input
          ref={textInputRef}
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
              dropdownPlacement === 'above'
                ? styles.dropdownAbove
                : styles.dropdownBelow,
              {
                maxHeight: availableDropdownHeight,
                backgroundColor: dropdownColors.background,
                shadowColor: '#000000',
              },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            >
              {renderDropdownContent()}
            </ScrollView>
          </ThemeView>
        )}
      </View>
    );
  },
);

AutocompleteInput.displayName = 'AutocompleteInput';

export default AutocompleteInput;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    left: baseFoundation.spacing[0],
    right: baseFoundation.spacing[0],
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
  dropdownBelow: {
    top: '100%',
    marginTop: baseFoundation.spacing[1],
  },
  dropdownAbove: {
    bottom: '100%',
    marginBottom: baseFoundation.spacing[1],
  },
  dropdownItem: {
    height: DROPDOWN_ITEM_HEIGHT,
    paddingLeft: baseFoundation.spacing[4],
    paddingRight: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[3],
  },
  dropdownItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: baseFoundation.spacing[2],
  },
  dropdownItemLabel: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },
  optionAvatar: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    borderRadius: baseFoundation.radii.round,
    overflow: 'hidden',
    backgroundColor: palette.theme.gray[5],
  },
  optionImage: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    transform: [{ translateY: -baseFoundation.dimension.x2 }],
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
