const router = require('express').Router();
const ctrl = require('../controllers/upload.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  uploadImage, uploadVideo, uploadAudio, uploadFile,
} = require('../middleware/upload.middleware');

router.use(requireAuth);

router.post('/image', uploadImage.single('file'), ctrl.image);
router.post('/video', uploadVideo.single('file'), ctrl.video);
router.post('/audio', uploadAudio.single('file'), ctrl.audio);
router.post('/file', uploadFile.single('file'), ctrl.file);

module.exports = router;