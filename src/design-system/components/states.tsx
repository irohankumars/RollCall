import { ActivityIndicator, Text, View } from 'react-native';
import { Button, Card } from './core';
import { radii, typography } from '../tokens';
import { useRollCallTheme } from '../theme-provider';

export type GlobalState = 'loading' | 'empty' | 'error' | 'offline' | 'success' | 'unauthorized' | 'session-expired' | 'processing';
const defaults: Record<Exclude<GlobalState, 'loading' | 'processing'>, { title: string; message: string }> = {
  empty: { title: 'Nothing here yet', message: 'New items will appear here when they become available.' },
  error: { title: 'Something went wrong', message: 'Try again. If this continues, contact your administrator.' },
  offline: { title: 'You are offline', message: 'Check your connection and try again.' },
  success: { title: 'Completed', message: 'Your changes were saved successfully.' },
  unauthorized: { title: 'Access restricted', message: 'Your account does not have permission to view this content.' },
  'session-expired': { title: 'Session expired', message: 'Sign in again to continue securely.' },
};

export function StateView({ state, title, message, onRetry }: { state: GlobalState; title?: string; message?: string; onRetry?: () => void }) {
  const { colors } = useRollCallTheme(); if (state === 'loading' || state === 'processing') return <Card><ActivityIndicator color={colors.primary} /><Text style={[typography.body, { textAlign: 'center', color: colors.textSecondary }]}>{state === 'loading' ? 'Loading' : 'Processing'}</Text></Card>;
  const copy = defaults[state]; return <Card><View style={{ width: 38, height: 38, borderRadius: radii.full, backgroundColor: state === 'error' || state === 'offline' ? colors.errorSurface : state === 'success' ? colors.successSurface : colors.infoSurface }} /><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>{title ?? copy.title}</Text><Text style={[typography.body, { color: colors.textSecondary }]}>{message ?? copy.message}</Text>{onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}</Card>;
}

export function Skeleton({ width = '100%', height = 16 }: { width?: number | `${number}%`; height?: number }) { const { colors } = useRollCallTheme(); return <View accessibilityLabel="Loading content" style={{ width, height, borderRadius: radii.sm, backgroundColor: colors.skeleton }} />; }

export function SkeletonCard() { return <Card><Skeleton width="42%" height={13} /><Skeleton width="75%" height={22} /><Skeleton /><Skeleton width="58%" /></Card>; }
