import client from '../api/client';

export const uploadService = {
  async uploadImage(uri, field = 'file') {
    const form = new FormData();
    form.append(field, { uri, name: `image-${Date.now()}.jpg`, type: 'image/jpeg' });
    const { data } = await client.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: () => {},
    });
    return data;
  },
  async uploadVideo(uri, field = 'file') {
    const form = new FormData();
    form.append(field, { uri, name: `video-${Date.now()}.mp4`, type: 'video/mp4' });
    const { data } = await client.post('/upload/video', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async uploadAudio(uri) {
    const form = new FormData();
    form.append('file', { uri, name: `audio-${Date.now()}.m4a`, type: 'audio/m4a' });
    const { data } = await client.post('/upload/audio', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async uploadFile(uri, name, mimeType) {
    const form = new FormData();
    form.append('file', { uri, name, type: mimeType });
    const { data } = await client.post('/upload/file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};