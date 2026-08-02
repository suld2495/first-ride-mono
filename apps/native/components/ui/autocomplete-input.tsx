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
  Pressable,
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
const DROPDOWN_INPUT_HEIGHT = baseFoundation.dimension.x52;
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

export interface AutocompleteDropdownInput {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export interface AutocompleteInputProps
  extends Omit<InputProps, 'onChangeText'> {
  /**
   * 입력창을 직접 편집하거나 버튼으로 사용할지 여부
   * @default 'input'
   */
  interactionMode?: 'input' | 'button';

  /**
   * 버튼 드롭다운의 첫 번째 항목에 표시할 입력창
   */
  dropdownInput?: AutocompleteDropdownInput;

  /**
   * 드롭다운이 닫혔을 때 호출할 핸들러
   */
  onDropdownDismiss?: () => void;

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
      interactionMode = 'input',
      dropdownInput,
      onDropdownDismiss,
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
    const dropdownInputRef = useRef<TextInput>(null);
    const visibleViewportBottomRef = useRef<number | null>(null);
    const isButtonMode = interactionMode === 'button';
    const hasDropdownInput = isButtonMode && dropdownInput !== undefined;
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
      isFocused &&
      showDropdown &&
      (items.length > 0 || loading || hasDropdownInput);
    const dismissDropdown = useCallback(() => {
      textInputRef.current?.blur();
      dropdownInputRef.current?.blur();
      setIsFocused(false);
      Keyboard.dismiss();
      onDropdownDismiss?.();
    }, [onDropdownDismiss]);
    const expectedDropdownHeight = useMemo(() => {
      const inputHeight = hasDropdownInput ? DROPDOWN_INPUT_HEIGHT : 0;

      if (loading || items.length === 0) {
        return Math.min(dropdownMaxHeight, inputHeight + DROPDOWN_EMPTY_HEIGHT);
      }

      return Math.min(
        dropdownMaxHeight,
        inputHeight + items.length * DROPDOWN_ITEM_HEIGHT,
      );
    }, [dropdownMaxHeight, hasDropdownInput, items.length, loading]);

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

    const handleButtonPress = useCallback(() => {
      if (inputProps.editable === false) {
        return;
      }

      if (isFocused) {
        dismissDropdown();

        return;
      }

      setIsFocused(true);
      updateDropdownPlacement();
    }, [
      dismissDropdown,
      inputProps.editable,
      isFocused,
      updateDropdownPlacement,
    ]);

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
        const isFirstItem = index === 0 && !hasDropdownInput;
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
      hasDropdownInput,
      handleSelectItem,
      theme.colors.field.icon,
      value,
    ]);

    const input = (
      <Input
        ref={textInputRef}
        {...inputProps}
        value={value}
        onChangeText={isButtonMode ? undefined : onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        editable={isButtonMode ? false : inputProps.editable}
        accessible={isButtonMode ? false : inputProps.accessible}
      />
    );

    return (
      <View
        ref={containerRef}
        style={[styles.container, containerStyle]}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {isButtonMode ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              inputProps.accessibilityLabel ?? inputProps.placeholder
            }
            accessibilityState={{
              disabled: inputProps.editable === false,
              expanded: isFocused,
            }}
            disabled={inputProps.editable === false}
            onPress={handleButtonPress}
          >
            <View pointerEvents="none">{input}</View>
          </Pressable>
        ) : (
          input
        )}

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
              testID="autocomplete-dropdown-scroll"
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            >
              {hasDropdownInput ? (
                <View
                  testID="autocomplete-dropdown-input-item"
                  style={[
                    styles.dropdownInputItem,
                    {
                      backgroundColor: dropdownColors.background,
                      borderBottomColor: dropdownColors.divider,
                    },
                  ]}
                >
                  <Input
                    ref={dropdownInputRef}
                    variant="filled"
                    value={dropdownInput.value}
                    placeholder={dropdownInput.placeholder}
                    onChangeText={dropdownInput.onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                  />
                </View>
              ) : null}
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
  dropdownInputItem: {
    height: DROPDOWN_INPUT_HEIGHT,
    padding: baseFoundation.spacing[1],
    borderBottomWidth: 1,
    borderTopLeftRadius: baseFoundation.dimension.x8,
    borderTopRightRadius: baseFoundation.dimension.x8,
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
