const ApiError = require('../utils/ApiError');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.CLOUDINARY_UNSIGNED_PRESET || 'nova_unsigned';

if (!CLOUD_NAME) {
  console.warn('⚠️ CLOUDINARY_CLOUD_NAME is not set — uploads will fail.');
}

/**
 * Upload a Buffer to Cloudinary using an unsigned upload preset.
 * Uses the /auto/upload endpoint so Cloudinary detects the resource type
 * from the actual bytes (image, video, raw file) — no api_key needed.
 */
async function uploadBuffer(buffer, { folder, publicId } = {}) {
  if (!CLOUD_NAME) throw new ApiError(500, 'Cloudinary is not configured.');

  // Node 18+ has global Blob and FormData
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('file', blob, publicId || `upload-${Date.now()}`);
  form.append('upload_preset', PRESET);
  if (folder) form.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = json?.error?.message || `Cloudinary ${res.status}`;
    console.error('💥 Cloudinary error:', msg);
    throw new ApiError(502, `Upload failed: ${msg}`);
  }

  return json;
}

exports.uploadImage = (buffer, folder = 'nova/images') =>
  uploadBuffer(buffer, { folder });

exports.uploadVideo = (buffer, folder = 'nova/videos') =>
  uploadBuffer(buffer, { folder });

exports.uploadAudio = (buffer, folder = 'nova/audio') =>
  uploadBuffer(buffer, { folder });

exports.uploadFile = (buffer, originalName = 'file', folder = 'nova/files') =>
  uploadBuffer(buffer, { folder, publicId: `${Date.now()}-${originalName}` });

exports.destroy = async () => {
  // Deletion requires signed requests — not needed for MVP.
};