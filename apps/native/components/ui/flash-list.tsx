import {
  FlashList as BaseFlashList,
  type FlashListProps,
  type ListRenderItem,
} from '@shopify/flash-list';
import React from 'react';

type BaseCompatFlashListProps<T> = Omit<
  FlashListProps<T>,
  'contentContainerStyle' | 'getItemLayout'
>;

type CompatFlashListProps<T> = BaseCompatFlashListProps<T> & {
  contentContainerStyle?: unknown;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  getItemLayout?: (
    data: T[] | null,
    index: number,
  ) => {
    length: number;
    offset: number;
    index: number;
  };
};

function FlashListInner<T>(
  props: CompatFlashListProps<T>,
  ref: React.ForwardedRef<BaseFlashList<T>>,
) {
  return <BaseFlashList ref={ref} {...(props as FlashListProps<T>)} />;
}

const FlashList = React.forwardRef(FlashListInner) as <T>(
  props: CompatFlashListProps<T> & {
    ref?: React.ForwardedRef<BaseFlashList<T>>;
  },
) => React.ReactElement;

export { FlashList };
export type {
  CompatFlashListProps,
  ListRenderItem,
  FlashListProps as NativeFlashListProps,
};
export type FlashListRef<T> = BaseFlashList<T>;
