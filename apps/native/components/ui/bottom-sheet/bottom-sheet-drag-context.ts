import React from 'react';
import type { GestureType } from 'react-native-gesture-handler';

export const BottomSheetDragContext = React.createContext<GestureType | null>(
  null,
);
