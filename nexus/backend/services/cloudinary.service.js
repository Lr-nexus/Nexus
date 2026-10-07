const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(new ApiError(502, `Upload failed: ${err.message}`));
      resolve(result);
    });
    stream.end(buffer);
  });
}

exports.uploadImage = (buffer, folder = 'nexus/images') =>
  uploadBuffer(buffer, { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] });

exports.uploadVideo = (buffer, folder = 'nexus/videos') =>
  uploadBuffer(buffer, { folder, resource_type: 'video' });

exports.uploadAudio = (buffer, folder = 'nexus/audio') =>
  uploadBuffer(buffer, { folder, resource_type: 'video' });

exports.uploadFile = (buffer, originalName = 'file', folder = 'nexus/files') =>
  uploadBuffer(buffer, { folder, resource_type: 'raw', public_id: `${Date.now()}-${originalName}` });

exports.destroy = async (publicId, resourceType = 'image') => {
  try { await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }); }
  catch {}
};