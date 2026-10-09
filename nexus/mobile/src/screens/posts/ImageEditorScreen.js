import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { processImage } from '../../utils/imageEditor';
import Header from '../../components/common/Header';

export default function ImageEditorScreen() {
  const { colors, spacing, radius } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { uri, onSaveCallbackKey } = route.params || {};

  const [working, setWorking] = useState(false);
  const [preview, setPreview] = useState(uri);
  const [square, setSquare] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);

  async function apply() {
    setWorking(true);
    try {
      const result = await processImage(uri, {
        square,
        rotate,
        flip: flipH ? 'horizontal' : null,
      });
      setPreview(result.uri);

      // Return the processed URI to the previous screen
      navigation.navigate({
        name: 'CreatePost',
        params: { editedUri: result.uri, editedAt: Date.now() },
        merge: true,
      });
    } catch (e) {
      Alert.alert('Could not edit image', e.message);
    } finally { setWorking(false); }
  }

  function reset() {
    setPreview(uri);
    setSquare(false);
    setRotate(0);
    setFlipH(false);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#000' }]} edges={['top']}>
      <Header
        title="Edit photo"
        transparent
        showBorder={false}
        leftIcon={<Ionicons name="close" size={26} color="#fff" />}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.previewWrap}>
        <Image
          source={{ uri: preview }}
          style={{
            width: '100%',
            height: '100%',
            transform: [
              { scaleX: flipH ? -1 : 1 },
              { rotate: `${rotate}deg` },
            ],
          }}
          resizeMode={square ? 'cover' : 'contain'}
        />
      </View>

      <View style={[styles.tools, { backgroundColor: '#0A0A0F', borderRadius: radius.xl, margin: spacing.md, padding: spacing.md }]}>
        <Tool icon="crop-outline" label="Square" active={square} onPress={() => setSquare((v) => !v)} />
        <Tool icon="refresh-outline" label="Rotate" onPress={() => setRotate((r) => (r + 90) % 360)} />
        <Tool icon="swap-horizontal-outline" label="Flip" active={flipH} onPress={() => setFlipH((v) => !v)} />
        <Tool icon="refresh-circle-outline" label="Reset" onPress={reset} />
      </View>

      <TouchableOpacity
        onPress={apply}
        disabled={working}
        style={[styles.applyBtn, { backgroundColor: colors.nexusBlue, borderRadius: radius.md, marginHorizontal: spacing.md, marginBottom: spacing.lg }]}
      >
        {working ? <ActivityIndicator color="#fff" /> : (
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Apply</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Tool({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.toolBtn} activeOpacity={0.7}>
      <View style={[styles.toolIcon, { backgroundColor: active ? '#2563EB' : 'rgba(255,255,255,0.08)' }]}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <Text style={{ color: '#fff', fontSize: 11, marginTop: 6 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  previewWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', margin: 16 },
  tools: { flexDirection: 'row', justifyContent: 'space-around' },
  toolBtn: { alignItems: 'center' },
  toolIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { height: 54, alignItems: 'center', justifyContent: 'center' },
});