import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const brandColors = {
  background: '#F9F7F7',
  secondary: '#DBE2EF',
  primary: '#3F72AF',
  primaryDark: '#112D4E',
} as const;

export const lightColors = {
  background: brandColors.background,
  textPrimary: '#112D4E', textSecondary: '#40566F', textMuted: '#68798C', textInverse: '#FFFFFF',
  surface: '#FFFFFF', surfaceSecondary: '#EEF2F7', surfaceElevated: '#FFFFFF',
  border: '#BFCBDD', borderSubtle: '#DDE4ED', primary: brandColors.primary, primaryPressed: '#315F94',
  success: '#18794E', warning: '#8A5A00', error: '#B42318', info: '#2869A5',
  attendanceGood: '#18794E', attendanceWarning: '#8A5A00', attendanceLow: '#B42318',
  successSurface: '#E4F4EC', warningSurface: '#FFF2CC', errorSurface: '#FDE8E7', infoSurface: '#E4F0FB',
  overlay: 'rgba(5, 19, 34, 0.62)', focusRing: 'transparent', disabled: '#AEB9C6', skeleton: '#E3E8EF',
} as const;

export const darkColors: ThemeColors = {
  background: '#090B0E', textPrimary: '#F5F7FA', textSecondary: '#C5CBD3', textMuted: '#9098A3', textInverse: '#090B0E',
  surface: '#0F1216', surfaceSecondary: '#15191E', surfaceElevated: '#1A1F25',
  border: '#2B3138', borderSubtle: '#1D2228', primary: '#85B0E0', primaryPressed: '#A3C4E8',
  success: '#71D3A6', warning: '#F3C969', error: '#FF938C', info: '#8FC0EE',
  attendanceGood: '#71D3A6', attendanceWarning: '#F3C969', attendanceLow: '#FF938C',
  successSurface: '#10241C', warningSurface: '#261F0E', errorSurface: '#291516', infoSurface: '#101C27',
  overlay: 'rgba(0, 0, 0, 0.78)', focusRing: 'transparent', disabled: '#5F6873', skeleton: '#1C2127',
};

export type ThemeColors = { [K in keyof typeof lightColors]: string };
export const colorSchemes = { light: lightColors as ThemeColors, dark: darkColors } as const;

export const spacing = { none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, jumbo: 40, giant: 48 } as const;
export const sizing = {
  touchTarget: 48, buttonHeight: 48, buttonHeightCompact: 40, inputHeight: 52,
  iconSm: 16, iconMd: 20, iconLg: 24, iconXl: 32,
  avatarSm: 32, avatarMd: 44, avatarLg: 64, controlSm: 20, controlMd: 24,
  contentReadable: 680, contentMax: 1120,
} as const;
export const radii = { sm: 8, md: 12, lg: 18, full: 999 } as const;
export const breakpoints = { compact: 0, medium: 600, expanded: 900, wide: 1200 } as const;

const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' });
const systemMono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace' });
const text = (fontSize: number, lineHeight: number, fontWeight: TextStyle['fontWeight'], letterSpacing = 0): TextStyle => ({ fontFamily: systemFont, fontSize, lineHeight, fontWeight, letterSpacing, includeFontPadding: false });
export const typography: Record<'display' | 'largeTitle' | 'title' | 'heading' | 'subheading' | 'body' | 'bodySmall' | 'label' | 'caption' | 'statistic' | 'percentage' | 'numeric', TextStyle> = {
  display: text(38, 44, '700', -1), largeTitle: text(32, 38, '700', -0.7), title: text(24, 30, '700', -0.35),
  heading: text(19, 25, '700', -0.1), subheading: text(17, 23, '600'), body: text(16, 23, '400'),
  bodySmall: text(14, 20, '400'), label: text(14, 19, '600', 0.1), caption: text(12, 16, '500', 0.2),
  statistic: text(30, 36, '700', -0.5), percentage: { ...text(42, 48, '700', -1), fontVariant: ['tabular-nums'] },
  numeric: { ...text(16, 22, '600'), fontFamily: systemMono, fontVariant: ['tabular-nums'] },
};

export const elevation = {
  none: {} as ViewStyle,
  low: Platform.select<ViewStyle>({ ios: { boxShadow: '0 1px 3px rgba(17,45,78,0.10)' }, android: { elevation: 1 }, default: { boxShadow: '0 1px 3px rgba(17,45,78,0.10)' } }) ?? {},
  medium: Platform.select<ViewStyle>({ ios: { boxShadow: '0 8px 24px rgba(17,45,78,0.14)' }, android: { elevation: 4 }, default: { boxShadow: '0 8px 24px rgba(17,45,78,0.14)' } }) ?? {},
} as const;
export const iconography = { sizes: { small: sizing.iconSm, medium: sizing.iconMd, large: sizing.iconLg }, activeOpacity: 1, inactiveOpacity: 0.68, strokeWeight: 'medium' } as const;
export const motion = { duration: { instant: 0, quick: 140, standard: 220, deliberate: 360 }, easing: { standard: [0.2, 0, 0, 1] as const, emphasized: [0.2, 0, 0, 1.15] as const } } as const;
