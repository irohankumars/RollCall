import { Text, View } from 'react-native';
import { Badge, Progress } from './core';
import { spacing, typography } from '../tokens';
import { useRollCallTheme } from '../theme-provider';

export type AttendanceStatus = 'good' | 'warning' | 'low';
const statusCopy = { good: 'Good attendance', warning: 'Approaching minimum', low: 'Low attendance' } as const;
export function AttendanceStatusIndicator({ status }: { status: AttendanceStatus }) { return <Badge label={statusCopy[status]} tone={status === 'good' ? 'success' : status === 'low' ? 'error' : 'warning'} />; }
export function AttendancePercentage({ value, status }: { value: number; status: AttendanceStatus }) { const { colors } = useRollCallTheme(); const color = status === 'good' ? colors.attendanceGood : status === 'warning' ? colors.attendanceWarning : colors.attendanceLow; return <View accessibilityLabel={`${statusCopy[status]}, ${value}%`} style={{ gap: spacing.sm }}><Text selectable style={[typography.percentage, { color }]}>{value}%</Text><AttendanceStatusIndicator status={status} /></View>; }
export function AttendanceProgress({ value, status }: { value: number; status: AttendanceStatus }) { return <Progress value={value} label={statusCopy[status]} tone={status} />; }

export type RecognitionState = 'recognized' | 'not-recognized' | 'processing' | 'failed';
export function RecognitionStatus({ state }: { state: RecognitionState }) { const data = { recognized: ['Recognized', 'success'], 'not-recognized': ['Not recognized', 'warning'], processing: ['Processing', 'info'], failed: ['Recognition failed', 'error'] } as const; return <Badge label={data[state][0]} tone={data[state][1]} />; }
