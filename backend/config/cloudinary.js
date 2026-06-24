/**
 * cloudinary.js — Cloudinary SDK configuration
 * ══════════════════════════════════════════════════════════════════════════
 * Set these 3 environment variables in your backend .env / Render Dashboard:
 *   CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   CLOUDINARY_API_KEY=your_api_key
 *   CLOUDINARY_API_SECRET=your_api_secret
 * ══════════════════════════════════════════════════════════════════════════
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // Always use https URLs
});

// Verify config on startup
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️  [Cloudinary] CLOUDINARY_CLOUD_NAME not set — uploads will fail!');
} else {
  console.log(`✅ [Cloudinary] Configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
}

module.exports = cloudinary;
