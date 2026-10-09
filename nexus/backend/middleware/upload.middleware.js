const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { UPLOAD_LIMITS } = require('../config/constants');

const storage = multer.memoryStorage();

const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'],
  audio: [
    'audio/mpeg',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/webm',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/3gpp',
    'application/octet-stream', // fallback for browsers/devices that don't set mime
  ],
  file: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
  ],
};

function makeFilter(kind) {
  const allowed = ALLOWED[kind] || [];
  return (req, file, cb) => {
    // Multipart uploads from RN often send application/octet-stream — accept
    // the file and rely on Cloudinary's /auto/upload to detect the real type.
    const mt = file.mimetype || 'application/octet-stream';
    if (kind === 'audio' || kind === 'video') {
      if (allowed.includes(mt) || mt === 'application/octet-stream') {
        return cb(null, true);
      }
      return cb(new ApiError(400, `Unsupported ${kind} file type: ${mt}`));
    }
    if (!allowed.includes(mt)) {
      return cb(new ApiError(400, `Unsupported ${kind} file type: ${mt}`));
    }
    cb(null, true);
  };
}

exports.uploadImage = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.IMAGE }, fileFilter: makeFilter('image') });
exports.uploadVideo = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.VIDEO }, fileFilter: makeFilter('video') });
exports.uploadAudio = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.AUDIO }, fileFilter: makeFilter('audio') });
exports.uploadFile  = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.FILE  }, fileFilter: makeFilter('file')  });