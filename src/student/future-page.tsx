import { router, type Href } from 'expo-router';
import { Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { PageContainer } from '@/shell/app-shell';
import { StudentShell } from './shell';

export function StudentFuturePage({ activeKey, title, message, back = false, backFallback = '/student' as Href }: { activeKey: string; title: string; message: string; back?: boolean; backFallback?: Href }) {
  return <StudentShell activeKey={activeKey} title={title} subtitle="Planned student experience" back={back} backFallback={backFallback}><PageContainer width="detail"><StateView state="empty" title={`${title} is coming next`} message={message} /><Button label="Return to Home" variant="secondary" onPress={() => router.replace('/student' as Href)} /></PageContainer></StudentShell>;
}
