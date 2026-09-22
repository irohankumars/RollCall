import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '@/design-system/components/core';
import { AlertBanner } from '@/design-system/components/feedback';
import { SelectField, TextField } from '@/design-system/components/forms';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { ChoiceSheet, IssueStatus } from '@/student/attendance-components';
import { studentAttendanceSessions, studentClient } from '@/student/student-data';
import { StudentShell } from '@/student/shell';
import type { AttendanceIssue, AttendanceIssueType } from '@/student/types';

const issueTypes: readonly { label: string; value: AttendanceIssueType }[] = [
  { label: 'Marked absent incorrectly', value: 'ABSENT_INCORRECT' },
  { label: 'Attendance is missing', value: 'MISSING' },
  { label: 'Attendance information is incorrect', value: 'INCORRECT_INFORMATION' },
  { label: 'Other', value: 'OTHER' },
];

type Sheet = 'type' | 'session';
type Errors = { type?: string; session?: string; explanation?: string };

export default function ReportAttendanceIssue() {
  const { colors } = useRollCallTheme();
  const params = useLocalSearchParams<{ sessionId?: string; subjectId?: string; state?: 'error' }>();
  const availableSessions = useMemo(() => params.subjectId ? studentAttendanceSessions.filter((item) => item.subjectId === params.subjectId) : studentAttendanceSessions, [params.subjectId]);
  const sessionOptions = useMemo(() => availableSessions.map((item) => ({ label: `${item.subject} · ${new Date(`${item.date}T12:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${item.startTime}`, value: item.id })), [availableSessions]);
  const initialSession = params.sessionId && availableSessions.some((item) => item.id === params.sessionId) ? params.sessionId : '';
  const [issueType, setIssueType] = useState<AttendanceIssueType | ''>('');
  const [sessionId, setSessionId] = useState(initialSession);
  const [explanation, setExplanation] = useState('');
  const [sheet, setSheet] = useState<Sheet>();
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [failedOnce, setFailedOnce] = useState(false);
  const [savedIssue, setSavedIssue] = useState<AttendanceIssue>();
  const selectedSession = studentAttendanceSessions.find((item) => item.id === sessionId);
  const selectedType = issueTypes.find((item) => item.value === issueType);

  const validate = () => {
    const next: Errors = {};
    if (!issueType) next.type = 'Choose the type of attendance issue.';
    if (!sessionId) next.session = 'Choose the attendance session this report is about.';
    if (issueType === 'OTHER' && explanation.trim().length < 10) next.explanation = 'Add at least 10 characters so the issue is clear.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate() || !issueType) return;
    setSubmitting(true); setSubmitError('');
    try {
      const shouldFail = params.state === 'error' && !failedOnce;
      setFailedOnce(true);
      const issue = await studentClient.submitAttendanceIssue({ type: issueType, sessionId, explanation: explanation.trim() }, shouldFail);
      setSavedIssue(issue);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'The issue could not be saved.');
    } finally {
      setSubmitting(false);
    }
  };

  if (savedIssue) return <StudentShell activeKey="attendance" title="Issue Reported" subtitle="Local frontend confirmation" back backFallback={'/student/attendance' as Href}><PageContainer width="compact">
    <AlertBanner title="Attendance issue saved" message="Your attendance issue has been saved on this device for this frontend build." tone="success" />
    <Card><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}><Text accessibilityRole="header" style={[typography.heading, { color: colors.textPrimary }]}>Report status</Text><IssueStatus status={savedIssue.status} /></View><Text style={[typography.body, { color: colors.textSecondary }]}>{selectedType?.label} · {selectedSession?.subject}</Text><Text style={[typography.caption, { color: colors.textMuted }]}>No external attendance service is connected in this frontend build.</Text></Card>
    <View style={{ gap: spacing.sm }}><Button label="View Session" onPress={() => router.replace(`/student/attendance/session/${savedIssue.sessionId}` as Href)} /><Button label="Return to Attendance" variant="secondary" onPress={() => router.replace('/student/attendance' as Href)} /></View>
  </PageContainer></StudentShell>;

  return <StudentShell activeKey="attendance" title="Report Attendance Issue" subtitle="Request a review of your record" back backFallback={'/student/attendance' as Href}>
    <PageContainer width="compact" contentContainerStyle={{ maxWidth: sizing.contentReadable }}>
      <AlertBanner title="Report only attendance concerns" message="Do not include passwords, biometric data, or unrelated personal information. This form is stored locally in the current frontend build." tone="info" />
      {submitError ? <AlertBanner title="Issue not saved" message={`${submitError} Your entries are still here.`} tone="error" action={<Button label="Retry" variant="text" onPress={() => void submit()} />} /> : null}
      <View style={{ gap: spacing.sm }}><SelectField label="Issue type *" value={selectedType?.label} disabled={submitting} onPress={() => setSheet('type')} />{errors.type ? <Text accessibilityRole="alert" style={[typography.caption, { color: colors.error }]}>{errors.type}</Text> : null}</View>
      <View style={{ gap: spacing.sm }}><SelectField label="Attendance session *" value={selectedSession ? `${selectedSession.subject} · ${new Date(`${selectedSession.date}T12:00:00`).toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${selectedSession.startTime}` : undefined} disabled={submitting} onPress={() => setSheet('session')} />{errors.session ? <Text accessibilityRole="alert" style={[typography.caption, { color: colors.error }]}>{errors.session}</Text> : null}</View>
      <TextField label="Explanation" required={issueType === 'OTHER'} multiline numberOfLines={5} textAlignVertical="top" placeholder="Add details that will help your lecturer review this record" value={explanation} editable={!submitting} onChangeText={(value) => { setExplanation(value); setErrors((current) => ({ ...current, explanation: undefined })); }} error={errors.explanation} helper={issueType === 'OTHER' ? 'Required for Other.' : 'Optional, but useful for reviewing the issue.'} style={{ minHeight: 120, paddingVertical: spacing.md }} />
      <Text style={[typography.caption, { color: colors.textMuted }]}>Submitting does not change your attendance. It creates a read-only local issue record for this frontend build.</Text>
      <Button label="Submit Issue" loading={submitting} disabled={submitting} onPress={() => void submit()} />
    </PageContainer>
    <ChoiceSheet visible={sheet === 'type'} title="Issue type" value={issueType} options={issueTypes} onChange={(value) => { setIssueType(value); setErrors((current) => ({ ...current, type: undefined })); }} onDismiss={() => setSheet(undefined)} />
    <ChoiceSheet visible={sheet === 'session'} title="Attendance session" value={sessionId} options={sessionOptions} onChange={(value) => { setSessionId(value); setErrors((current) => ({ ...current, session: undefined })); }} onDismiss={() => setSheet(undefined)} />
  </StudentShell>;
}
