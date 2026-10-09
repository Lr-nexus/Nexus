const ApiError = require('../utils/ApiError');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.CLOUDINARY_UNSIGNED_PRESET || 'nova_unsigned';

if (!CLOUD_NAME) {
  console.warn('⚠️ CLOUDINARY_CLOUD_NAME is not set — uploads will fail.');
}

// Choose Cloudinary endpoint based on resource type.
// Using the specific endpoint is more reliable than /auto/ for videos.
async function uploadBuffer(buffer, { folder, publicId, resourceType = 'auto' } = {}) {
  if (!CLOUD_NAME) throw new ApiError(500, 'Cloudinary is not configured.');

  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('file', blob, publicId || `upload-${Date.now()}`);
  form.append('upload_preset', PRESET);
  if (folder) form.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  let res;
  try {
    res = await fetch(url, { method: 'POST', body: form });
  } catch (netErr) {
    console.error('💥 Cloudinary network error:', netErr.message);
    throw new ApiError(502, `Upload network error: ${netErr.message}`);
  }

  const raw = await res.text();
  let json;
  try { json = JSON.parse(raw); } catch { json = { raw }; }

  if (!res.ok) {
    const msg = json?.error?.message || `Cloudinary HTTP ${res.status}`;
    console.error('💥 Cloudinary upload failed:');
    console.error('   URL:', url);
    console.error('   Status:', res.status);
    console.error('   Response:', raw.slice(0, 500));
    throw new ApiError(502, `Upload failed: ${msg}`);
  }

  return json;
}

exports.uploadImage = (buffer, folder = 'nova/images') =>
  uploadBuffer(buffer, { folder, resourceType: 'image' });

exports.uploadVideo = (buffer, folder = 'nova/videos') =>
  uploadBuffer(buffer, { folder, resourceType: 'video' });

exports.uploadAudio = (buffer, folder = 'nova/audio') =>
  uploadBuffer(buffer, { folder, resourceType: 'video' }); // Cloudinary stores audio as `video`

exports.uploadFile = (buffer, originalName = 'file', folder = 'nova/files') =>
  uploadBuffer(buffer, {
    folder,
    publicId: `${Date.now()}-${originalName}`,
    resourceType: 'raw',
  });

exports.destroy = async () => {
  // Deletion requires signed requests — not needed for MVP.
};