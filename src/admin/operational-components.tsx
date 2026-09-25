import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/design-system/components/core';
import { TextField } from '@/design-system/components/forms';
import { spacing } from '@/design-system/tokens';
import { ManagementRow, RelationshipSection } from '@/hod/management-components';
import { type SavedFilter, useAdmin } from './admin-provider';

export function SavedFilterBar({ scope, onApply }: { scope: SavedFilter['scope']; onApply: (value: string) => void }) {
  const data = useAdmin();
  const filters = data.savedFilters.filter((item) => item.scope === scope);
  const [editing, setEditing] = useState<string>();
  const [name, setName] = useState('');
  if (!filters.length) return null;
  return <RelationshipSection title="Saved filters">{filters.map((filter) => editing === filter.id ? <View key={filter.id} style={{ paddingVertical: spacing.sm, gap: spacing.sm }}><TextField label="Filter name" value={name} onChangeText={setName} /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}><Button label="Save name" disabled={!name.trim()} onPress={() => { data.renameFilter(filter.id, name.trim()); setEditing(undefined); }} /><Button label="Cancel" variant="text" onPress={() => setEditing(undefined)} /></View></View> : <ManagementRow key={filter.id} title={filter.name} detail="Saved on this device" onPress={() => onApply(filter.value)} actions={<View style={{ flexDirection: 'row' }}><Button label="Rename" variant="text" onPress={() => { setEditing(filter.id); setName(filter.name); }} /><Button label="Remove" variant="text" onPress={() => data.removeFilter(filter.id)} /></View>} />)}</RelationshipSection>;
}
