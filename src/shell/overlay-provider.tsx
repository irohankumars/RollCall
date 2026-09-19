import React, { createContext, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { AlertBanner, BottomSheet, Dialog, Toast } from '@/design-system/components/feedback';
import { Button } from '@/design-system/components/core';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';

type Message = { title: string; message: string };
type OverlayContextValue = {
  showToast: (message: string) => void;
  showAlert: (message: Message) => void;
  showConfirmation: (message: Message) => void;
  showSheet: (message: Message) => void;
  setLoading: (loading: boolean) => void;
};
const OverlayContext = createContext<OverlayContextValue | null>(null);

export function GlobalOverlayProvider({ children }: React.PropsWithChildren) {
  const { colors } = useRollCallTheme();
  const [toast, setToast] = useState<string>(); const [alert, setAlert] = useState<Message>(); const [dialog, setDialog] = useState<Message>(); const [sheet, setSheet] = useState<Message>(); const [loading, setLoading] = useState(false);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  const showToast = (message: string) => { setToast(message); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(undefined), 2400); };
  return <OverlayContext value={{ showToast, showAlert: setAlert, showConfirmation: setDialog, showSheet: setSheet, setLoading }}>
    {children}
    <View style={{ position: 'absolute', inset: 0, pointerEvents: 'box-none' }}>
      {alert ? <View style={{ position: 'absolute', top: spacing.giant, left: spacing.lg, right: spacing.lg, maxWidth: 560, alignSelf: 'center', pointerEvents: 'box-none' }}><AlertBanner title={alert.title} message={alert.message} action={<Button label="Dismiss" variant="text" onPress={() => setAlert(undefined)} />} /></View> : null}
      {toast ? <View style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.giant, alignItems: 'center', pointerEvents: 'none' }}><Toast message={toast} /></View> : null}
      {loading ? <View accessibilityRole="progressbar" accessibilityLabel="Loading" style={{ position: 'absolute', inset: 0, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}><ActivityIndicator size="large" color={colors.textInverse} /><Text style={[typography.label, { color: colors.textInverse }]}>Loading</Text></View> : null}
    </View>
    <Dialog visible={Boolean(dialog)} title={dialog?.title ?? ''} message={dialog?.message ?? ''} onDismiss={() => setDialog(undefined)} onConfirm={() => { setDialog(undefined); showToast('Confirmed'); }} />
    <BottomSheet visible={Boolean(sheet)} title={sheet?.title ?? ''} onDismiss={() => setSheet(undefined)}><Text style={[typography.body, { color: colors.textSecondary }]}>{sheet?.message}</Text><Button label="Done" onPress={() => setSheet(undefined)} /></BottomSheet>
  </OverlayContext>;
}

export function useGlobalOverlays() { const value = React.use(OverlayContext); if (!value) throw new Error('useGlobalOverlays must be used within GlobalOverlayProvider'); return value; }
