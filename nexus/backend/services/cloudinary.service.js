const cloudinary = require('cloudinary').v2;
const ApiError = require('../utils/ApiError');

const PRESET = process.env.CLOUDINARY_UNSIGNED_PRESET || 'nova_unsigned';

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) {
        console.error('💥 Cloudinary error:', err.message);
        return reject(new ApiError(502, `Upload failed: ${err.message}`));
      }
      resolve(result);
    });
    stream.end(buffer);
  });
}

exports.uploadImage = (buffer, folder = 'nova/images') =>
  uploadBuffer(buffer, { upload_preset: PRESET, folder, resource_type: 'image' });

exports.uploadVideo = (buffer, folder = 'nova/videos') =>
  uploadBuffer(buffer, { upload_preset: PRESET, folder, resource_type: 'video' });

exports.uploadAudio = (buffer, folder = 'nova/audio') =>
  uploadBuffer(buffer, { upload_preset: PRESET, folder, resource_type: 'video' });

exports.uploadFile = (buffer, originalName = 'file', folder = 'nova/files') =>
  uploadBuffer(buffer, {
    upload_preset: PRESET,
    folder,
    resource_type: 'raw',
    public_id: `${Date.now()}-${originalName}`,
  });

exports.destroy = async (publicId, resourceType = 'image') => {
  try { await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }); }
  catch {}
};