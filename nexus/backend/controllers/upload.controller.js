const cloudinaryService = require('../services/cloudinary.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ok } = require('../utils/ApiResponse');

exports.image = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const r = await cloudinaryService.uploadImage(req.file.buffer);
  ok(res, { url: r.secure_url, publicId: r.public_id });
});

exports.video = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const r = await cloudinaryService.uploadVideo(req.file.buffer);
  ok(res, {
    url: r.secure_url,
    publicId: r.public_id,
    thumbnail: r.secure_url.replace(/\.[^.]+$/, '.jpg'),
  });
});

exports.audio = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const r = await cloudinaryService.uploadAudio(req.file.buffer);
  ok(res, { url: r.secure_url, publicId: r.public_id });
});

exports.file = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded.');
  const r = await cloudinaryService.uploadFile(req.file.buffer, req.file.originalname);
  ok(res, { url: r.secure_url, publicId: r.public_id, name: req.file.originalname });
});