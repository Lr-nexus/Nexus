import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { secureStorage } from '../../utils/secureStorage';

export default function ChatLockScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation } = route.params || {};

  const [pin, setPin] = useState('');
  const [mode, setMode] = useState('enter');
  const [firstPin, setFirstPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const stored = await secureStorage.getItem('nova_chat_pin');
      setSavedPin(stored);
      setMode(stored ? 'enter' : 'set');
      setTimeout(() => inputRef.current?.focus(), 200);
    })();
  }, []);

  function onDigit(text) {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    setPin(clean);
    if (clean.length === 4) setTimeout(() => submit(clean), 60);
  }

  function submit(value) {
    if (mode === 'set') {
      setFirstPin(value);
      setPin('');
      setMode('confirm');
      return;
    }

    if (mode === 'confirm') {
      if (value !== firstPin) {
        Alert.alert('PINs did not match. Try again.');
        setPin('');
        setFirstPin('');
        setMode('set');
        return;
      }
      (async () => {
        await secureStorage.setItem('nova_chat_pin', value);
        if (conversation?._id) {
          await secureStorage.setItem(`nova_chat_unlocked_${conversation._id}`, '1');
        }
        navigation.replace('Chat', { conversation });
      })();
      return;
    }

    if (value === savedPin) {
      (async () => {
        if (conversation?._id) {
          await secureStorage.setItem(`nova_chat_unlocked_${conversation._id}`, '1');
        }
        navigation.replace('Chat', { conversation });
      })();
    } else {
      Alert.alert('Wrong PIN');
      setPin('');
    }
  }

  const title =
    mode === 'set' ? 'Set a chat PIN'
    : mode === 'confirm' ? 'Confirm your PIN'
    : 'Enter your PIN';

  const subtitle =
    mode === 'set' ? 'Create a 4-digit PIN to lock private chats.'
    : mode === 'confirm' ? 'Enter the same PIN again.'
    : 'This chat is locked.';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed" size={36} color={colors.nexusBlue} />
        </View>

        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 20 }}>
          {title}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
          {subtitle}
        </Text>

        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={onDigit}
          keyboardType="number-pad"
          maxLength={4}
          style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        />

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  borderColor: pin.length > i ? colors.nexusBlue : colors.border,
                  backgroundColor: pin.length > i ? colors.nexusBlue : 'transparent',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <KeyBtn key={n} label={String(n)} colors={colors} onPress={() => onDigit(pin + n)} />
          ))}
          <View style={styles.key} />
          <KeyBtn label="0" colors={colors} onPress={() => onDigit(pin + '0')} />
          <KeyBtn
            icon="backspace-outline"
            colors={colors}
            onPress={() => setPin(pin.slice(0, -1))}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function KeyBtn({ label, icon, colors, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.key} activeOpacity={0.6}>
      {icon ? (
        <Ionicons name={icon} size={24} color={colors.text} />
      ) : (
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '600' }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', paddingTop: 20 },
  iconWrap: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  dotsRow: { flexDirection: 'row', gap: 16, marginTop: 44 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    marginTop: 44,
    justifyContent: 'space-between',
  },
  key: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});