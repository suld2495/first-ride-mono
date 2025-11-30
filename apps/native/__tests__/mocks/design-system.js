// @repo/design-system 모킹
module.exports = {
  // Content Colors
  contentColors: {
    heading: { light: '#111827', dark: '#F9FAFB' },
    title: { light: '#1F2937', dark: '#F3F4F6' },
    subtitle: { light: '#374151', dark: '#E5E7EB' },
    body: { light: '#374151', dark: '#D1D5DB' },
    bodySecondary: { light: '#4B5563', dark: '#9CA3AF' },
    bodyTertiary: { light: '#6B7280', dark: '#6B7280' },
    muted: { light: '#6B7280', dark: '#6B7280' },
    disabled: { light: '#9CA3AF', dark: '#4B5563' },
    placeholder: { light: '#9CA3AF', dark: '#4B5563' },
    link: { light: '#2563EB', dark: '#60A5FA' },
    linkHover: { light: '#1D4ED8', dark: '#93C5FD' },
    inverse: { light: '#FFFFFF', dark: '#111827' },
  },

  // Surface Colors
  surfaceColors: {
    base: { light: '#FFFFFF', dark: '#111827' },
    raised: { light: '#FFFFFF', dark: '#1F2937' },
    sunken: { light: '#F9FAFB', dark: '#030712' },
    overlay: { light: '#FFFFFF', dark: '#1F2937' },
    hover: { light: '#F3F4F6', dark: '#1F2937' },
    active: { light: '#E5E7EB', dark: '#374151' },
    selected: { light: '#EFF6FF', dark: '#1E3A8A' },
    disabledBg: { light: '#F3F4F6', dark: '#1F2937' },
  },

  // Border Colors
  borderColors: {
    default: { light: '#E5E7EB', dark: '#374151' },
    subtle: { light: '#F3F4F6', dark: '#1F2937' },
    emphasis: { light: '#D1D5DB', dark: '#4B5563' },
    strong: { light: '#9CA3AF', dark: '#6B7280' },
    hover: { light: '#D1D5DB', dark: '#4B5563' },
    focus: { light: '#2563EB', dark: '#3B82F6' },
    error: { light: '#DC2626', dark: '#EF4444' },
    success: { light: '#16A34A', dark: '#22C55E' },
    divider: { light: '#F3F4F6', dark: '#1F2937' },
    dividerEmphasis: { light: '#E5E7EB', dark: '#374151' },
  },

  // Action Colors
  actionColors: {
    primary: { light: '#2563EB', dark: '#3B82F6' },
    primaryHover: { light: '#1D4ED8', dark: '#60A5FA' },
    primaryActive: { light: '#1E40AF', dark: '#93C5FD' },
    primaryDisabled: { light: '#93C5FD', dark: '#1E3A8A' },
    secondary: { light: '#4B5563', dark: '#6B7280' },
    secondaryHover: { light: '#374151', dark: '#9CA3AF' },
    destructive: { light: '#DC2626', dark: '#EF4444' },
    destructiveHover: { light: '#B91C1C', dark: '#F87171' },
    ghostHover: { light: '#F3F4F6', dark: '#1F2937' },
  },

  // Feedback Colors
  feedbackColors: {
    success: {
      bg: { light: '#F0FDF4', dark: '#052E16' },
      border: { light: '#BBF7D0', dark: '#166534' },
      text: { light: '#166534', dark: '#BBF7D0' },
      icon: { light: '#22C55E', dark: '#22C55E' },
    },
    error: {
      bg: { light: '#FEF2F2', dark: '#450A0A' },
      border: { light: '#FECACA', dark: '#991B1B' },
      text: { light: '#991B1B', dark: '#FECACA' },
      icon: { light: '#EF4444', dark: '#EF4444' },
    },
    warning: {
      bg: { light: '#FFFBEB', dark: '#451A03' },
      border: { light: '#FED7AA', dark: '#92400E' },
      text: { light: '#92400E', dark: '#FED7AA' },
      icon: { light: '#F59E0B', dark: '#F59E0B' },
    },
    info: {
      bg: { light: '#EFF6FF', dark: '#1E3A8A' },
      border: { light: '#BFDBFE', dark: '#1E40AF' },
      text: { light: '#1E40AF', dark: '#BFDBFE' },
      icon: { light: '#3B82F6', dark: '#3B82F6' },
    },
  },

  // Spacing
  spacing: {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // Typography
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Typography Variants
  typographyVariants: {
    title: { fontSize: 24, fontWeight: '700', lineHeight: 1.2 },
    subtitle: { fontSize: 18, fontWeight: '600', lineHeight: 1.3 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 1.5 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 1.4 },
    label: { fontSize: 14, fontWeight: '500', lineHeight: 1.4 },
  },

  // Button Style Creator
  createButtonStyle: () => ({
    container: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: '#2563EB',
    },
    text: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    iconColor: '#FFFFFF',
  }),
};
