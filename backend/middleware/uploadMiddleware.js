/**
 * uploadMiddleware.js — Cloudinary-based upload middleware
 * ══════════════════════════════════════════════════════════════════════════
 *
 * All files are uploaded directly to Cloudinary CDN.
 * No local disk storage — safe for serverless/cloud deployments (Render, Vercel).
 *
 * Upload types:
 *  • Images  — jpg, jpeg, png, webp, gif, svg (max 10 MB)
 *  • Videos  — mp4, mov, webm, avi, mkv       (max 200 MB)
 *  • Docs    — pdf, doc, docx, xls, xlsx      (max 20 MB)
 *
 * Cloudinary folders:
 *  pakka-tourism/
 *    avatars/     ← employee profile photos
 *    company/     ← company logo
 *    itinerary/   ← itinerary images & videos
 *    images/      ← general images
 *    videos/      ← general videos
 *    documents/   ← employee docs, contracts
 * ══════════════════════════════════════════════════════════════════════════
 */

const multer                              = require('multer');
const { CloudinaryStorage }               = require('multer-storage-cloudinary');
const cloudinary                          = require('../config/cloudinary');

// ── MIME type sets for validation ─────────────────────────────────────────────
const IMAGE_MIMES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif',  'image/svg+xml',
]);
const VIDEO_MIMES = new Set([
  'video/mp4', 'video/quicktime', 'video/webm',
  'video/x-msvideo', 'video/x-matroska', 'video/avi',
]);
const DOC_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.avi', '.mkv']);
const DOC_EXTS   = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);

// ── File extension helper ──────────────────────────────────────────────────────
const path = require('path');
const getExt = (filename) => path.extname(filename || '').toLowerCase();

// ── File filters ──────────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const ext = getExt(file.originalname);
  if (IMAGE_EXTS.has(ext) && IMAGE_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      'Only image files are allowed (jpg, png, webp, gif, svg)'));
  }
};

const videoFilter = (req, file, cb) => {
  const ext = getExt(file.originalname);
  if (VIDEO_EXTS.has(ext) && VIDEO_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      'Only video files are allowed (mp4, mov, webm, avi, mkv)'));
  }
};

const docFilter = (req, file, cb) => {
  const ext = getExt(file.originalname);
  if (DOC_EXTS.has(ext) && DOC_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      'Only documents are allowed (pdf, doc, docx, xls, xlsx)'));
  }
};

const mediaFilter = (req, file, cb) => {
  const ext = getExt(file.originalname);
  if ((IMAGE_EXTS.has(ext) && IMAGE_MIMES.has(file.mimetype)) ||
      (VIDEO_EXTS.has(ext) && VIDEO_MIMES.has(file.mimetype))) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE',
      'Only images (jpg, png, webp) and videos (mp4, mov, webm) are allowed'));
  }
};

// ── Cloudinary Storage factory ────────────────────────────────────────────────
// `resourceType` = 'image' | 'video' | 'raw' (auto works for images/videos)
const makeCloudinaryStorage = (folder, resourceType = 'auto', transformations = []) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const ext           = getExt(file.originalname);
      const publicId      = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const isVideo       = VIDEO_EXTS.has(ext);
      const finalResource = resourceType === 'auto'
        ? (isVideo ? 'video' : 'image')
        : resourceType;

      return {
        folder:          `pakka-tourism/${folder}`,
        public_id:       publicId,
        resource_type:   finalResource,
        // For images: auto quality + format optimization
        ...(finalResource === 'image' && {
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
            ...transformations,
          ],
        }),
      };
    },
  });

// ── Uploader instances ────────────────────────────────────────────────────────

// Company logo — images only, 5 MB (auto-optimize quality)
const uploadCompanyLogo = multer({
  storage:    makeCloudinaryStorage('company', 'image', [{ width: 400, crop: 'limit' }]),
  fileFilter: imageFilter,
  limits:     { fileSize: 5 * 1024 * 1024 },
}).single('logo');

// Profile avatar — images only, 3 MB (resize to max 300px)
const uploadAvatar = multer({
  storage:    makeCloudinaryStorage('avatars', 'image', [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }]),
  fileFilter: imageFilter,
  limits:     { fileSize: 3 * 1024 * 1024 },
}).single('avatar');

// Itinerary image — images only, 10 MB
const uploadItineraryImage = multer({
  storage:    makeCloudinaryStorage('itinerary', 'image', [{ width: 1200, crop: 'limit' }]),
  fileFilter: imageFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
}).single('image');

// Itinerary VIDEO — videos only, 200 MB
const uploadItineraryVideo = multer({
  storage:    makeCloudinaryStorage('itinerary', 'video'),
  fileFilter: videoFilter,
  limits:     { fileSize: 200 * 1024 * 1024 },
}).single('video');

// Itinerary MEDIA — images OR videos, multi-file up to 5 files
const uploadItineraryMedia = multer({
  storage:    makeCloudinaryStorage('itinerary', 'auto'),
  fileFilter: mediaFilter,
  limits:     { fileSize: 200 * 1024 * 1024, files: 5 },
}).array('media', 5);

// General image upload — images only, 10 MB
const uploadImage = multer({
  storage:    makeCloudinaryStorage('images', 'image'),
  fileFilter: imageFilter,
  limits:     { fileSize: 10 * 1024 * 1024 },
}).single('image');

// General video upload — videos only, 200 MB
const uploadVideo = multer({
  storage:    makeCloudinaryStorage('videos', 'video'),
  fileFilter: videoFilter,
  limits:     { fileSize: 200 * 1024 * 1024 },
}).single('video');

// Document upload — docs only, 20 MB
const uploadDocument = multer({
  storage:    makeCloudinaryStorage('documents', 'raw'),
  fileFilter: docFilter,
  limits:     { fileSize: 20 * 1024 * 1024 },
}).single('document');

// ── Promise wrapper — controllers can use async/await ────────────────────────
const runUpload = (uploader) => (req, res) =>
  new Promise((resolve, reject) => {
    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        reject(Object.assign(err, { statusCode: 400 }));
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

// ── Middleware error wrapper ───────────────────────────────────────────────────
const withUpload = (uploader) => (req, res, next) => {
  uploader(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error(`[Upload Error] Multer: ${err.code} — ${err.message}`);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
        code:    err.code,
      });
    }
    if (err) {
      console.error(`[Upload Error] ${err.message || err}`);
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
  });
};

// ── Helper: extract secure Cloudinary URL from uploaded file ─────────────────
// After upload, req.file.path = Cloudinary secure_url
const buildFileUrl = (file) => {
  if (!file) return null;
  // multer-storage-cloudinary sets file.path = secure_url
  return file.path || file.secure_url || null;
};

// ── Helper: delete file from Cloudinary ───────────────────────────────────────
const deleteFile = async (publicIdOrUrl, resourceType = 'image') => {
  if (!publicIdOrUrl) return;
  try {
    // If it's a full URL, extract the public_id
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.startsWith('http')) {
      // Extract public_id from URL: ...pakka-tourism/avatars/123456.jpg → pakka-tourism/avatars/123456
      const parts    = publicIdOrUrl.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      const folder   = parts.slice(-3, -1).join('/'); // e.g. pakka-tourism/avatars
      publicId       = `${folder}/${filename}`;
    }
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted: ${publicId}`);
  } catch (err) {
    console.warn(`[Cloudinary] Failed to delete ${publicIdOrUrl}: ${err.message}`);
  }
};

module.exports = {
  // Specific uploaders
  uploadCompanyLogo,
  uploadAvatar,
  uploadItineraryImage,
  uploadItineraryVideo,
  uploadItineraryMedia,
  uploadImage,
  uploadVideo,
  uploadDocument,

  // Utilities
  runUpload,
  withUpload,
  buildFileUrl,
  deleteFile,
};
