import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Badge, Button } from '@/design-system/components/core';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ManagementRow, RelationshipSection } from '@/hod/management-components';
import { CopyIdentifier } from '@/hod/operations-components';
import { useHodOperations } from '@/hod/operations-provider';
export default function NotificationDetail(){const {colors}=useRollCallTheme();const {notificationId}=useLocalSearchParams<{notificationId:string}>();const operations=useHodOperations();const item=operations.notifications.find((value)=>value.id===notificationId);if(!item)return <HodShell activeKey="department" title="Notification" back><PageContainer><StateView state="empty" title="Notification not found"/></PageContainer></HodShell>;return <HodShell activeKey="department" title="Notification details" subtitle={item.status} back backFallback="/hod/management/notifications"><PageContainer width="detail"><View style={{gap:spacing.sm}}><View style={{flexDirection:'row',alignItems:'center',gap:spacing.md}}><Text accessibilityRole="header" style={[typography.largeTitle,{color:colors.textPrimary,flex:1}]}>{item.title}</Text><Badge label={item.status} tone={item.status==='Sent'?'success':item.status==='Failed'?'error':'warning'}/></View><CopyIdentifier label="notification identifier" value={item.id}/></View><Text style={[typography.body,{color:colors.textPrimary}]}>{item.message}</Text><RelationshipSection title="Delivery"><ManagementRow title={item.audience} detail={`${item.category} · ${item.priority} priority`} meta={item.sentAt?`Sent ${new Date(item.sentAt).toLocaleString()}`:`Created ${new Date(item.createdAt).toLocaleString()}`}/></RelationshipSection>{item.status==='Draft'?<Button label="Send notification" onPress={()=>operations.sendNotification(item.id)} style={{alignSelf:'flex-start'}}/>:null}</PageContainer></HodShell>;}
