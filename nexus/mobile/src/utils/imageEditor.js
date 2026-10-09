import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Process an image asset before upload.
 * @param {string} uri       Source image URI
 * @param {object} opts
 *   - square: boolean      Crop to square (feed posts)
 *   - maxWidth: number     Resize longest side (default 1440)
 *   - rotate: number       Rotate degrees (0/90/180/270)
 *   - quality: number      JPEG quality 0-1 (default 0.85)
 *   - flip: 'horizontal' | 'vertical' | null
 */
export async function processImage(uri, opts = {}) {
  const {
    square = false,
    maxWidth = 1440,
    rotate = 0,
    quality = 0.85,
    flip = null,
  } = opts;

  const actions = [];

  if (flip) {
    actions.push({ flip: flip === 'horizontal' ? ImageManipulator.FlipType.Horizontal : ImageManipulator.FlipType.Vertical });
  }

  if (rotate && rotate !== 0) {
    actions.push({ rotate });
  }

  if (square) {
    const meta = await ImageManipulator.manipulateAsync(uri, [], {});
    const side = Math.min(meta.width, meta.height);
    actions.push({
      crop: {
        originX: Math.floor((meta.width - side) / 2),
        originY: Math.floor((meta.height - side) / 2),
        width: side,
        height: side,
      },
    });
    if (side > maxWidth) {
      actions.push({ resize: { width: maxWidth } });
    }
  } else {
    // Only resize if larger than max
    const meta = await ImageManipulator.manipulateAsync(uri, [], {});
    if (meta.width > maxWidth || meta.height > maxWidth) {
      if (meta.width >= meta.height) actions.push({ resize: { width: maxWidth } });
      else actions.push({ resize: { height: maxWidth } });
    }
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return result; // { uri, width, height }
}

export async function processAvatar(uri) {
  return processImage(uri, { square: true, maxWidth: 512, quality: 0.9 });
}