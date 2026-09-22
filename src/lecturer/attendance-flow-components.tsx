import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecognitionStatus } from '@/design-system/components/attendance';
import { Avatar, Badge, Statistic } from '@/design-system/components/core';
import { radii, sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import type { LecturerClass, LecturerStudent } from './types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type AttendanceMethod = 'FACE' | 'MANUAL';
export type CameraReadiness = 'required' | 'ready' | 'denied' | 'unavailable';
export type ReviewFilter = 'ALL' | 'PRESENT' | 'ABSENT' | 'REVIEW';

export function SessionHeader({ item, date, status }: { item: LecturerClass; date: Date; status?: string }) {
  const { colors } = useRollCallTheme();
  return <View style={{ gap: spacing.sm }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.lg }}>
      <View style={{ flex: 1, minWidth: 0, gap: spacing.xs }}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.textPrimary }]}>{item.subjectName}</Text>
        <Text style={[typography.subheading, { color: colors.textSecondary }]}>{item.subjectCode} · {item.batchName}</Text>
      </View>
      {status ? <Badge label={status} tone="info" /> : null}
    </View>
    <Text style={[typography.bodySmall, { color: colors.textMuted }]}>{date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })} · {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
  </View>;
}

export function AttendanceSummary({ present, absent, total, remaining }: { present: number; absent?: number; total: number; remaining?: number }) {
  return <View accessibilityLabel={`${present} present, ${absent ?? 0} absent, ${total} total`} style={{ flexDirection: 'row', gap: spacing.giant, flexWrap: 'wrap' }}>
    <Statistic value={String(present)} label="Present" />
    {remaining === undefined ? <Statistic value={String(absent ?? 0)} label="Absent" /> : <Statistic value={String(remaining)} label="Remaining" />}
    <Statistic value={String(total)} label="Total" />
  </View>;
}

const methodCopy: Record<AttendanceMethod, { title: string; detail: string; icon: IconName }> = {
  FACE: { title: 'Face recognition', detail: 'Camera capture is not connected in this build.', icon: 'scan-outline' },
  MANUAL: { title: 'Manual attendance', detail: 'Mark students locally without camera access.', icon: 'checkbox-outline' },
};

export function AttendanceMethodSelector({ value, onChange }: { value: AttendanceMethod; onChange: (value: AttendanceMethod) => void }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  return <View accessibilityRole="radiogroup" accessibilityLabel="Attendance method" style={{ gap: spacing.sm }}>
    {(['FACE', 'MANUAL'] as const).map((method) => {
      const selected = method === value; const copy = methodCopy[method];
      return <Pressable key={method} accessibilityRole="radio" accessibilityLabel={copy.title} accessibilityHint={copy.detail} accessibilityState={{ selected }} onPress={() => onChange(method)} style={({ pressed }) => ({ minHeight: isCompact ? 76 : 68, borderRadius: radii.md, borderWidth: selected ? 2 : 1, borderColor: selected ? colors.primary : colors.borderSubtle, backgroundColor: pressed ? colors.surfaceSecondary : colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.76 : 1 })}>
        <View accessibilityElementsHidden style={{ width: 40, height: 40, borderRadius: radii.full, backgroundColor: selected ? colors.infoSurface : colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={copy.icon} size={sizing.iconMd} color={selected ? colors.primary : colors.textMuted} /></View>
        <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{copy.title}</Text><Text style={[typography.caption, { color: colors.textSecondary }]}>{copy.detail}</Text></View>
        {selected ? <Ionicons accessibilityLabel="Selected" name="checkmark-circle" size={sizing.iconLg} color={colors.primary} /> : <View accessibilityElementsHidden style={{ width: sizing.iconLg }} />}
      </Pressable>;
    })}
  </View>;
}

const cameraCopy: Record<CameraReadiness, { title: string; message: string; tone: 'info' | 'success' | 'warning' | 'error'; icon: IconName }> = {
  required: { title: 'Camera permission required', message: 'Allow camera access to continue. This build does not capture or process images.', tone: 'info', icon: 'camera-outline' },
  ready: { title: 'Camera ready', message: 'Camera readiness is confirmed for this local attendance session.', tone: 'success', icon: 'checkmark-circle-outline' },
  denied: { title: 'Camera access denied', message: 'Retry the permission check or switch to manual attendance.', tone: 'warning', icon: 'lock-closed-outline' },
  unavailable: { title: 'Camera unavailable', message: 'Face recognition is unavailable on this device. Manual attendance remains available.', tone: 'error', icon: 'camera-reverse-outline' },
};

export function CameraReadinessPanel({ state, actions }: { state: CameraReadiness; actions?: React.ReactNode }) {
  const { colors } = useRollCallTheme(); const copy = cameraCopy[state]; const color = colors[copy.tone]; const background = colors[`${copy.tone}Surface` as const];
  return <View accessibilityRole="alert" style={{ borderRadius: radii.md, backgroundColor: background, padding: spacing.lg, gap: spacing.md }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Ionicons accessibilityElementsHidden name={copy.icon} size={sizing.iconLg} color={color} /><View style={{ flex: 1, gap: spacing.xs }}><Text style={[typography.subheading, { color }]}>{copy.title}</Text><Text style={[typography.bodySmall, { color: colors.textPrimary }]}>{copy.message}</Text></View></View>
    {actions}
  </View>;
}

export function ReadinessStatus({ items }: { items: { label: string; ready: boolean; detail?: string }[] }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLabel="Session readiness" style={{ gap: spacing.xs }}>{items.map((item) => <View key={item.label} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
    <Ionicons accessibilityLabel={item.ready ? 'Ready' : 'Not ready'} name={item.ready ? 'checkmark-circle' : 'ellipse-outline'} size={sizing.iconMd} color={item.ready ? colors.success : colors.textMuted} />
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.body, { color: colors.textPrimary }]}>{item.label}</Text>{item.detail ? <Text style={[typography.caption, { color: colors.textMuted }]}>{item.detail}</Text> : null}</View>
  </View>)}</View>;
}

export function StudentIdentity({ name, studentId }: { name: string; studentId: string }) {
  const { colors } = useRollCallTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}><Avatar name={name} size="medium" /><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>{name}</Text><Text style={[typography.numeric, { color: colors.textMuted }]}>{studentId}</Text></View></View>;
}

export function RecognitionPanel({ student, processing = false }: { student?: LecturerStudent; processing?: boolean }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityLiveRegion="polite" accessibilityLabel={processing ? 'Recognition processing' : student ? `${student.name} recognized and marked present` : 'Waiting for recognition'} style={{ minHeight: 210, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surface, padding: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
    <View accessibilityElementsHidden style={{ width: 72, height: 72, borderRadius: radii.full, backgroundColor: student ? colors.successSurface : colors.infoSurface, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={student ? 'person-circle-outline' : 'scan-outline'} size={40} color={student ? colors.success : colors.primary} /></View>
    <RecognitionStatus state={processing ? 'processing' : student ? 'recognized' : 'not-recognized'} />
    {student ? <StudentIdentity name={student.name} studentId={student.rollNumber} /> : <View style={{ alignItems: 'center', gap: spacing.xs }}><Text style={[typography.subheading, { color: colors.textPrimary }]}>Ready for recognition</Text><Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>Camera processing is not connected. Use the recognition control to continue locally.</Text></View>}
  </View>;
}

export function StudentProgressRow({ item, present, needsReview = false }: { item: LecturerStudent; present: boolean; needsReview?: boolean }) {
  const { colors } = useRollCallTheme();
  const label = needsReview ? 'Needs review' : present ? 'Present' : 'Waiting';
  return <View accessibilityLabel={`${item.name}, ${item.rollNumber}, ${label}`} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
    <Avatar name={item.name} size="small" />
    <View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.rollNumber}</Text></View>
    <Badge label={label} tone={needsReview ? 'warning' : present ? 'success' : 'neutral'} />
  </View>;
}

const reviewFilters: { label: string; value: ReviewFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Present', value: 'PRESENT' },
  { label: 'Absent', value: 'ABSENT' },
  { label: 'Needs review', value: 'REVIEW' },
];

export function AttendanceFilterControl({ value, onChange }: { value: ReviewFilter; onChange: (value: ReviewFilter) => void }) {
  const { colors } = useRollCallTheme();
  return <View accessibilityRole="radiogroup" accessibilityLabel="Attendance filters" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{reviewFilters.map((filter) => {
    const selected = value === filter.value;
    return <Pressable key={filter.value} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => onChange(filter.value)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, borderRadius: radii.full, borderWidth: 1, borderColor: selected ? colors.primary : colors.borderSubtle, backgroundColor: selected ? colors.infoSurface : pressed ? colors.surfaceSecondary : colors.surface, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.76 : 1 })}><Text style={[typography.label, { color: selected ? colors.primary : colors.textSecondary }]}>{filter.label}</Text></Pressable>;
  })}</View>;
}

export function ReviewAttendanceRow({ item, status, needsReview, disabled = false, onChange }: { item: LecturerStudent; status: 'PRESENT' | 'ABSENT'; needsReview: boolean; disabled?: boolean; onChange: (status: 'PRESENT' | 'ABSENT') => void }) {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive();
  const controls = <View accessibilityRole="radiogroup" accessibilityLabel={`${item.name} attendance status`} style={{ flexDirection: 'row', gap: spacing.sm }}>{(['PRESENT', 'ABSENT'] as const).map((option) => {
    const selected = status === option;
    return <Pressable key={option} accessibilityRole="radio" accessibilityLabel={option === 'PRESENT' ? 'Present' : 'Absent'} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => onChange(option)} style={({ pressed }) => ({ minHeight: sizing.touchTarget, minWidth: 76, borderRadius: radii.md, borderWidth: 1, borderColor: selected ? (option === 'PRESENT' ? colors.success : colors.error) : colors.borderSubtle, backgroundColor: selected ? (option === 'PRESENT' ? colors.successSurface : colors.errorSurface) : pressed ? colors.surfaceSecondary : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.52 : pressed ? 0.76 : 1 })}><Text style={[typography.caption, { color: selected ? (option === 'PRESENT' ? colors.success : colors.error) : colors.textSecondary }]}>{option === 'PRESENT' ? 'Present' : 'Absent'}</Text></Pressable>;
  })}</View>;
  return <View accessibilityLabel={`${item.name}, ${item.rollNumber}, ${status === 'PRESENT' ? 'Present' : 'Absent'}${needsReview ? ', needs review' : ''}`} style={{ minHeight: isCompact ? 116 : 76, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle, flexDirection: isCompact ? 'column' : 'row', alignItems: isCompact ? 'stretch' : 'center', gap: spacing.md }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}><Avatar name={item.name} size="small" /><View style={{ flex: 1, gap: spacing.xxs }}><Text style={[typography.label, { color: colors.textPrimary }]}>{item.name}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>{item.rollNumber}</Text></View>{needsReview ? <Badge label="Needs review" tone="warning" /> : null}</View>
    {controls}
  </View>;
}
