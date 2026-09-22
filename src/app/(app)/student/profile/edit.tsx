import { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Avatar, Button } from '@/design-system/components/core';
import { AlertBanner, BottomSheet, Confirmation } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { SectionHeading } from '@/lecturer/components';
import { useStudentFinal } from '@/student/final-provider';
import { studentAcademicInfo } from '@/student/s3-data';
import { studentHomeData } from '@/student/student-data';
import { StudentShell } from '@/student/shell';

export default function EditStudentProfile() {
  const { profile, loading } = useStudentFinal();
  if (loading) return <StudentShell activeKey="home" title="Edit Profile" subtitle="Permitted personal details" back><PageContainer width="detail"><StateView state="loading" /></PageContainer></StudentShell>;
  return <EditStudentProfileForm key={`${profile.displayName}-${profile.phone}`} />;
}

function EditStudentProfileForm() {
  const { colors } = useRollCallTheme(); const { isCompact } = useResponsive(); const { profile, saveProfile } = useStudentFinal(); const { save } = useLocalSearchParams<{ save?: 'failed' }>();
  const [displayName, setDisplayName] = useState(profile.displayName); const [phone, setPhone] = useState(profile.phone); const [photoSheet, setPhotoSheet] = useState(false); const [photoState, setPhotoState] = useState<'unchanged' | 'selected' | 'removed'>('unchanged'); const [saving, setSaving] = useState(false); const [saveError, setSaveError] = useState(''); const [leave, setLeave] = useState(false); const [touched, setTouched] = useState(false);
  const nameError = !displayName.trim() ? 'Display name is required.' : displayName.trim().length < 2 ? 'Enter at least 2 characters.' : undefined; const phoneError = phone.trim() && !/^\+?[\d\s()-]{7,20}$/.test(phone.trim()) ? 'Enter a valid phone number.' : undefined; const dirty = displayName !== profile.displayName || phone !== profile.phone || photoState !== 'unchanged';
  const cancel = () => dirty ? setLeave(true) : router.replace('/student/profile' as Href);
  const submit = async () => { setTouched(true); if (nameError || phoneError || !dirty || saving) return; setSaving(true); setSaveError(''); await new Promise((resolve) => setTimeout(resolve, 450)); if (save === 'failed') { setSaving(false); setSaveError('Your changes could not be saved. Your entries are still here.'); return; } await saveProfile({ displayName: displayName.trim(), phone: phone.trim() }); setSaving(false); router.replace('/student/profile?saved=1' as Href); };
  const actions = <View style={{ width: '100%', maxWidth: 680, alignSelf: 'center', flexDirection: isCompact ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: spacing.sm }}><Button label="Cancel" variant="secondary" disabled={saving} onPress={cancel} /><Button label="Save changes" loading={saving} disabled={!dirty || Boolean(nameError) || Boolean(phoneError)} onPress={() => void submit()} /></View>;
  return <StudentShell activeKey="home" title="Edit Profile" subtitle="Permitted personal details" back onBack={cancel}><PageContainer width="detail" fixedActions={actions}>
    {saveError ? <AlertBanner title="Profile not saved" message={saveError} tone="error" action={<Button label="Try again" variant="text" onPress={() => void submit()} />} /> : null}<View style={{ gap: spacing.md }}><SectionHeading title="Profile photo" /><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}><Avatar name={displayName || profile.displayName} size="large" /><View style={{ flex: 1, gap: spacing.xs }}><Button label="Change photo" variant="secondary" onPress={() => setPhotoSheet(true)} /><Text style={[typography.caption, { color: colors.textMuted }]}>{photoState === 'selected' ? 'A new photo is selected for this local preview.' : photoState === 'removed' ? 'Initials will be used instead of a photo.' : 'Initials are shown when no photo is available.'}</Text></View></View></View><View style={{ gap: spacing.lg }}><SectionHeading title="Editable details" /><TextField label="Display name" required value={displayName} onChangeText={(value) => { setDisplayName(value); setSaveError(''); }} onBlur={() => setTouched(true)} error={touched ? nameError : undefined} /><TextField label="Phone" value={phone} keyboardType="phone-pad" placeholder="Add a phone number" onChangeText={(value) => { setPhone(value); setSaveError(''); }} error={touched ? phoneError : undefined} /></View><View style={{ gap: spacing.lg }}><SectionHeading title="Institution-managed details" /><TextField label="Student ID" value={studentHomeData.student.rollNumber} editable={false} helper="Managed by your institution." /><TextField label="Department" value={studentAcademicInfo.department} editable={false} helper="Managed by your institution." /><TextField label="Programme" value={studentAcademicInfo.programme} editable={false} helper="Managed by your institution." /></View>
  </PageContainer><BottomSheet visible={photoSheet} title="Profile photo" onDismiss={() => setPhotoSheet(false)}><View style={{ alignItems: 'center', gap: spacing.sm }}><Avatar name={displayName || profile.displayName} size="large" /><Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Photo changes are local preview-only in this frontend build.</Text></View><Button label="Choose photo" icon={<Ionicons name="image-outline" size={sizing.iconMd} color={colors.textInverse} />} onPress={() => { setPhotoState('selected'); setPhotoSheet(false); }} /><Button label="Use initials" variant="secondary" onPress={() => { setPhotoState('removed'); setPhotoSheet(false); }} /></BottomSheet><Confirmation visible={leave} title="Unsaved changes" message="Discard your changes?" cancelLabel="Keep editing" confirmLabel="Discard" destructive onDismiss={() => setLeave(false)} onConfirm={() => router.replace('/student/profile' as Href)} /></StudentShell>;
}
