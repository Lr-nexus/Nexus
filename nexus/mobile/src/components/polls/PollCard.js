import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { pollsApi } from '../../api/polls.api';

export default function PollCard({ poll: initial, onVoted }) {
  const { colors, spacing, radius } = useTheme();
  const [poll, setPoll] = useState(initial);
  const [picked, setPicked] = useState([]);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(initial?.myVote?.length > 0);

  const total = poll.totalVotes || 0;

  function toggle(i) {
    if (voted || poll.isClosed) return;
    if (poll.multipleChoice) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    } else {
      setPicked([i]);
    }
  }

  async function submit() {
    if (!picked.length || voting) return;
    setVoting(true);
    try {
      const res = await pollsApi.vote(poll._id, picked);
      setPoll(res.poll);
      setVoted(true);
      onVoted?.(res.poll);
    } catch {} finally {
      setVoting(false);
    }
  }

  function pct(i) {
    const v = poll.options[i]?.votes || 0;
    return total ? Math.round((v / total) * 100) : 0;
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md },
      ]}
    >
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{poll.question}</Text>
      <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 3 }}>
        {total} vote{total === 1 ? '' : 's'}
        {poll.multipleChoice ? ' · multiple choice' : ''}
        {poll.isClosed ? ' · closed' : ''}
      </Text>

      <View style={{ marginTop: 12, gap: 8 }}>
        {poll.options.map((o, i) => {
          const active = picked.includes(i) || (voted && poll.myVote?.includes?.(i));
          const showBars = voted || poll.isClosed;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => toggle(i)}
              activeOpacity={0.85}
              style={[
                styles.option,
                {
                  borderColor: active ? colors.electricBlue : colors.border,
                  backgroundColor: colors.bg,
                  borderRadius: radius.md,
                },
              ]}
            >
              {showBars ? (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { width: `${pct(i)}%`, backgroundColor: colors.nexusBlue + '33', borderRadius: radius.md },
                  ]}
                />
              ) : null}
              <View style={styles.optionRow}>
                <Text style={{ color: colors.text, fontWeight: active ? '800' : '600', flex: 1 }}>
                  {o.text}
                </Text>
                {showBars ? (
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>
                    {pct(i)}%
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!voted && !poll.isClosed ? (
        <TouchableOpacity
          onPress={submit}
          disabled={!picked.length || voting}
          style={[
            styles.voteBtn,
            { backgroundColor: picked.length ? colors.nexusBlue : colors.card, borderRadius: radius.md },
          ]}
        >
          <Text style={{ color: picked.length ? '#fff' : colors.textDim, fontWeight: '700' }}>
            {voting ? 'Voting…' : 'Vote'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginHorizontal: 12, marginVertical: 6 },
  option: { borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  voteBtn: { height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
});