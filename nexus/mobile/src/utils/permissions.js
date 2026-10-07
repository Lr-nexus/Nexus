import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AudioModule } from 'expo-audio';

export const permissions = {
  async camera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  },

  async microphone() {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
  },

  async photos() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  },

  async location() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },
};