const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { UPLOAD_LIMITS } = require('../config/constants');

const storage = multer.memoryStorage();

const ALLOWED = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  audio: ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/wav'],
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
    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, `Unsupported ${kind} file type: ${file.mimetype}`));
    }
    cb(null, true);
  };
}

exports.uploadImage = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.IMAGE }, fileFilter: makeFilter('image') });
exports.uploadVideo = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.VIDEO }, fileFilter: makeFilter('video') });
exports.uploadAudio = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.AUDIO }, fileFilter: makeFilter('audio') });
exports.uploadFile = multer({ storage, limits: { fileSize: UPLOAD_LIMITS.FILE }, fileFilter: makeFilter('file') });