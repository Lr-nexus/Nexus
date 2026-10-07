import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { pollsApi } from '../../api/polls.api';
import Button from '../common/Button';

export default function PollComposer({ contextType, contextId, onCreated, onCancel }) {
  const { colors, radius, spacing } = useTheme();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);

  function setOpt(i, v) {
    setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));
  }

  function addOption() {
    if (options.length >= 10) return;
    setOptions((o) => [...o, '']);
  }

  function removeOption(i) {
    if (options.length <= 2) return;
    setOptions((o) => o.filter((_, idx) => idx !== i));
  }

  async function create() {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) {
      return Alert.alert('Add a question and at least 2 options');
    }
    setBusy(true);
    try {
      const res = await pollsApi.create({
        question: question.trim(),
        options: clean,
        multipleChoice: multiple,
        anonymous,
        contextType,
        contextId,
      });
      onCreated?.(res.poll);
    } catch (e) {
      Alert.alert('Could not create poll', e?.response?.data?.message || 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.wrap, { padding: spacing.lg }]}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>
        Create poll
      </Text>

      <TextInput
        placeholder="Ask a question…"
        placeholderTextColor={colors.textDim}
        value={question}
        onChangeText={setQuestion}
        style={[
          styles.input,
          { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md },
        ]}
      />

      {options.map((o, i) => (
        <View key={i} style={styles.optRow}>
          <TextInput
            placeholder={`Option ${i + 1}`}
            placeholderTextColor={colors.textDim}
            value={o}
            onChangeText={(v) => setOpt(i, v)}
            style={[
              styles.input,
              styles.flexInput,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, borderRadius: radius.md },
            ]}
          />
          {options.length > 2 ? (
            <TouchableOpacity onPress={() => removeOption(i)} style={styles.removeBtn}>
              <Text style={{ color: colors.danger, fontSize: 20 }}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}

      {options.length < 10 ? (
        <TouchableOpacity onPress={addOption} style={styles.addOpt}>
          <Text style={{ color: colors.electricBlue, fontWeight: '700' }}>+ Add option</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.toggleRow}>
        <ToggleChip label="Multiple choice" active={multiple} onPress={() => setMultiple((v) => !v)} />
        <ToggleChip label="Anonymous" active={anonymous} onPress={() => setAnonymous((v) => !v)} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} fullWidth={false} style={{ flex: 1 }} />
        <Button title={busy ? 'Creating…' : 'Create poll'} onPress={create} loading={busy} fullWidth={false} style={{ flex: 2 }} />
      </View>
    </View>
  );
}

function ToggleChip({ label, active, onPress }) {
  const { colors, radius } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: active ? colors.nexusBlue : colors.card, borderColor: colors.border, borderRadius: radius.pill },
      ]}
    >
      <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700', fontSize: 12 }}>
        {active ? '✓ ' : ''}{label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  input: { borderWidth: 1, paddingHorizontal: 14, height: 48, marginBottom: 10 },
  flexInput: { flex: 1, marginBottom: 0 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  removeBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  addOpt: { alignSelf: 'flex-start', paddingVertical: 8 },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
});