import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const IMAGES = 'images';
const VIDEOS = 'videos';

export async function pickImage({ allowsEditing = true, quality = 0.8 } = {}) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission denied');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [IMAGES],
    allowsEditing,
    quality,
  });
  if (res.canceled) return null;
  return res.assets[0];
}

export async function pickVideo() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission denied');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [VIDEOS],
  });
  if (res.canceled) return null;
  return res.assets[0];
}

export async function captureImage() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('Camera permission denied');
  const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  if (res.canceled) return null;
  return res.assets[0];
}

export async function pickMultipleImages({ selectionLimit = 10 } = {}) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission denied');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: [IMAGES],
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 0.85,
  });
  if (res.canceled) return [];
  return res.assets;
}

export async function pickDocument() {
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled) return null;
  const f = res.assets?.[0];
  if (!f) return null;
  return {
    uri: f.uri,
    name: f.name,
    size: f.size,
    mimeType: f.mimeType || 'application/octet-stream',
  };
}