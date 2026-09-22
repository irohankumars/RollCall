import { useEffect, useMemo, useState } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/auth-provider';
import { Avatar, Button } from '@/design-system/components/core';
import { AlertBanner, BottomSheet, Confirmation } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { sizing, spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { useResponsive } from '@/design-system/use-responsive';
import { PageContainer } from '@/shell/app-shell';
import { LecturerPageSkeleton, LecturerShell, SectionHeading } from '@/lecturer/components';
import { useLecturerProfile, type LecturerProfileDraft } from '@/lecturer/profile-provider';

type PhotoState = 'unchanged' | 'selected' | 'removed';

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export default function EditLecturerProfile() {
  const { profile, loading, saveProfile } = useLecturerProfile();
  if (loading) return <LecturerShell activeKey="profile" title="Edit profile" subtitle="Personal information" back><PageContainer width="detail"><LecturerPageSkeleton rows={5} /></PageContainer></LecturerShell>;
  return <LoadedEditLecturerProfile profile={profile} saveProfile={saveProfile} />;
}

function LoadedEditLecturerProfile({ profile, saveProfile }: { profile: LecturerProfileDraft; saveProfile: (profile: LecturerProfileDraft) => Promise<void> }) {
  const { colors } = useRollCallTheme();
  const { isCompact } = useResponsive();
  const { session } = useAuth();
  const { save } = useLocalSearchParams<{ save?: 'failed' }>();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone);
  const [photoState, setPhotoState] = useState<PhotoState>('unchanged');
  const [photoSheet, setPhotoSheet] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [touched, setTouched] = useState({ displayName: false, phone: false });

  const nameError = !displayName.trim() ? 'Display name is required.' : displayName.trim().length < 2 ? 'Enter at least 2 characters.' : undefined;
  const phoneError = phone.trim() && !/^\+?[\d\s()-]{7,20}$/.test(phone.trim()) ? 'Enter a valid phone number.' : undefined;
  const dirty = displayName !== profile.displayName || phone !== profile.phone || photoState !== 'unchanged';
  const valid = !nameError && !phoneError;
  const photoMessage = photoState === 'selected' ? 'A new photo is selected for this preview.' : photoState === 'removed' ? 'The selected photo will be removed.' : 'Initials are shown when no profile photo is available.';

  const leaveProfile = () => router.replace('/lecturer/profile' as Href);
  const attemptLeave = () => { if (dirty) setLeaveDialog(true); else leaveProfile(); };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { if (!dirty) return false; setLeaveDialog(true); return true; });
    return () => subscription.remove();
  }, [dirty]);

  const immutable = useMemo(() => ({
    designation: 'Lecturer',
    department: 'Computer Science and Engineering',
    college: session?.user.college?.name ?? 'Institution not assigned',
    employeeId: `FAC-${session?.user.id.slice(0, 6).toUpperCase() ?? '000000'}`,
    email: session?.user.loginIdentifier ?? 'Not available',
  }), [session?.user.college?.name, session?.user.id, session?.user.loginIdentifier]);

  const submit = async () => {
    setTouched({ displayName: true, phone: true });
    if (!valid || saving || !dirty) return;
    setSaving(true); setSaveError(undefined);
    await wait(650);
    if (save === 'failed') {
      setSaving(false);
      setSaveError('Your changes could not be saved. Nothing was lost. Try again.');
      return;
    }
    await saveProfile({ displayName, phone });
    setSaving(false);
    router.replace('/lecturer/profile?saved=1' as Href);
  };

  const actions = <View style={{ width: '100%', maxWidth: 680, alignSelf: 'center', flexDirection: isCompact ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: spacing.sm }}><Button label="Cancel" variant="secondary" onPress={attemptLeave} disabled={saving} style={isCompact ? { width: '100%' } : undefined} /><Button label="Save changes" loading={saving} disabled={!dirty || !valid} onPress={() => void submit()} style={isCompact ? { width: '100%' } : undefined} /></View>;

  return <LecturerShell activeKey="profile" title="Edit profile" subtitle="Personal information" back onBack={attemptLeave}>
    <PageContainer width="detail" fixedActions={actions}>
      <>
        {saveError ? <AlertBanner title="Profile not saved" message={saveError} tone="error" action={<Button label="Try again" variant="text" onPress={() => void submit()} />} /> : null}

        <View style={{ gap: spacing.md }}><SectionHeading title="Profile photo" /><View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}><Avatar name={displayName || profile.displayName} size="large" /><View style={{ flex: 1, alignItems: 'flex-start', gap: spacing.xs }}><Button label="Change photo" variant="secondary" onPress={() => setPhotoSheet(true)} /><Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.textMuted }]}>{photoMessage}</Text></View></View></View>

        <View style={{ gap: spacing.lg }}><SectionHeading title="Personal details" />
          <TextField label="Display name" required value={displayName} autoCapitalize="words" autoComplete="name" onChangeText={(value) => { setDisplayName(value); setSaveError(undefined); }} onBlur={() => setTouched((current) => ({ ...current, displayName: true }))} error={touched.displayName ? nameError : undefined} helper={!touched.displayName ? 'This name appears across RollCall.' : undefined} />
          <TextField label="Phone" value={phone} keyboardType="phone-pad" autoComplete="tel" placeholder="Add a phone number" onChangeText={(value) => { setPhone(value); setSaveError(undefined); }} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} error={touched.phone ? phoneError : undefined} helper={!touched.phone ? 'Optional. Visible only in your profile.' : undefined} />
        </View>

        <View style={{ gap: spacing.lg }}><SectionHeading title="Institution details" />
          <TextField label="Designation" value={immutable.designation} editable={false} helper="Managed by your institution." />
          <TextField label="Department" value={immutable.department} editable={false} helper="Managed by your institution." />
          <TextField label="College" value={immutable.college} editable={false} helper="Managed by your institution." />
          <TextField label="Employee ID" value={immutable.employeeId} editable={false} helper="Managed by your institution." />
          <TextField label="Institutional email" value={immutable.email} editable={false} helper="Managed by your institution." />
        </View>
      </>
    </PageContainer>

    <BottomSheet visible={photoSheet} title="Profile photo" onDismiss={() => setPhotoSheet(false)}>
      <View style={{ alignItems: 'center', gap: spacing.sm }}><Avatar name={displayName || profile.displayName} size="large" /><Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>Photo changes are preview-only in this frontend build.</Text></View>
      <Button label="Change photo" icon={<Ionicons accessibilityElementsHidden name="image-outline" size={sizing.iconMd} color={colors.textInverse} />} onPress={() => { setPhotoState('selected'); setPhotoSheet(false); }} />
      <Button label="Remove photo" variant="secondary" disabled={photoState !== 'selected'} icon={<Ionicons accessibilityElementsHidden name="trash-outline" size={sizing.iconMd} color={colors.textPrimary} />} onPress={() => { setPhotoState('removed'); setPhotoSheet(false); }} />
      <Button label="Cancel" variant="text" onPress={() => setPhotoSheet(false)} />
    </BottomSheet>

    <Confirmation visible={leaveDialog} title="Unsaved changes" message="Discard your changes?" cancelLabel="Keep editing" confirmLabel="Discard" destructive onDismiss={() => setLeaveDialog(false)} onConfirm={() => { setLeaveDialog(false); leaveProfile(); }} />
  </LecturerShell>;
}
