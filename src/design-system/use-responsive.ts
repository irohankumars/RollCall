import { useWindowDimensions } from 'react-native';
import { breakpoints, sizing, spacing } from './tokens';

export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();
  const size = width >= breakpoints.expanded ? 'expanded' : width >= breakpoints.medium ? 'medium' : 'compact';
  return { width, height, fontScale, size, isCompact: size === 'compact', isExpanded: size === 'expanded', contentPadding: width >= breakpoints.expanded ? spacing.xxxl : spacing.lg, maxContentWidth: sizing.contentMax } as const;
}
