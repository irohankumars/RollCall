import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { AlertBanner, Confirmation } from '@/design-system/components/feedback';
import { TextField } from '@/design-system/components/forms';
import { StateView } from '@/design-system/components/states';
import { spacing, typography } from '@/design-system/tokens';
import { useRollCallTheme } from '@/design-system/theme-provider';
import { PageContainer } from '@/shell/app-shell';
import { HodShell } from '@/hod/components';
import { ManagementRow, RelationshipSection } from '@/hod/management-components';
import { CopyIdentifier } from '@/hod/operations-components';
import { useHodManagement } from '@/hod/management-provider';
import { useHodOperations } from '@/hod/operations-provider';

export default function IssueReview() {
  const { colors }=useRollCallTheme(); const {issueId}=useLocalSearchParams<{issueId:string}>(); const data=useHodManagement(); const operations=useHodOperations(); const issue=operations.issues.find((item)=>item.id===issueId); const [reason,setReason]=useState(''); const [decision,setDecision]=useState<'Approved'|'Rejected'>(); if(!issue)return <HodShell activeKey="department" title="Attendance issue" back><PageContainer><StateView state="empty" title="Issue not found" /></PageContainer></HodShell>;
  const student=data.students.find((item)=>item.id===issue.studentId); const subject=data.subjects.find((item)=>item.id===issue.subjectId); const section=data.sections.find((item)=>item.id===issue.sectionId); const decided=['Approved','Rejected','Resolved'].includes(issue.status);
  return <HodShell activeKey="department" title="Correction review" subtitle={issue.status} back backFallback="/hod/management/issues"><PageContainer width="detail"><View style={{gap:spacing.xs}}><Text accessibilityRole="header" style={[typography.largeTitle,{color:colors.textPrimary}]}>{student?.name}</Text><CopyIdentifier label="student USN" value={student?.usn??''} /></View><RelationshipSection title="Attendance context"><ManagementRow title={subject?.name??'Subject'} detail={`${subject?.code} · ${section?.name}`} meta={`Session ${issue.sessionId}`} /><ManagementRow title="Requested correction" detail={`${issue.existingStatus} → ${issue.requestedStatus}`} meta={issue.issueType} /></RelationshipSection><AlertBanner title="Student reason" message={issue.reason} tone="info" />{decided?<RelationshipSection title="Decision history"><ManagementRow title={issue.status} detail={issue.decisionReason??'No reason recorded'} meta={`${issue.decidedBy??'HOD'} · ${issue.decidedAt?new Date(issue.decidedAt).toLocaleString():'Decision pending'}`} /></RelationshipSection>:<><TextField label="Decision reason" value={reason} onChangeText={setReason} multiline helper="Required for an audit-friendly final decision." /><View style={{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm}}><Button label="Approve correction" disabled={!reason.trim()} onPress={()=>setDecision('Approved')} /><Button label="Reject" variant="secondary" disabled={!reason.trim()} onPress={()=>setDecision('Rejected')} /></View></>}<Confirmation visible={Boolean(decision)} title={`${decision} correction?`} message={`This changes the reviewed result from ${issue.existingStatus} to ${decision==='Approved'?issue.requestedStatus:issue.existingStatus}. The decision and reason remain in correction history.`} confirmLabel={decision??'Confirm'} destructive={decision==='Rejected'} onDismiss={()=>setDecision(undefined)} onConfirm={()=>{if(decision)operations.decideIssue(issue.id,decision,reason.trim());setDecision(undefined);}} /></PageContainer></HodShell>;
}
