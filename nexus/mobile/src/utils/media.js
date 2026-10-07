import * as ImagePicker from 'expo-image-picker';

// SDK 57+ uses `mediaTypes: ['images']` / `['videos']` strings.
// Older SDKs used ImagePicker.MediaTypeOptions.Images — we handle both.
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