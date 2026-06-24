/**
 * errorHandler.js — Production-grade Express error handler
 * ══════════════════════════════════════════════════════════════════════════
 * Handles all errors passed via next(err) in routes/controllers.
 * Logs full details to console for easy debugging in Render logs.
 * ══════════════════════════════════════════════════════════════════════════
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || 'Internal Server Error';

  // ── Mongoose: duplicate key ─────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `${field} already exists`;
    statusCode = 400;
  }

  // ── Mongoose: validation error ──────────────────────────────────────────
  if (err.name === 'ValidationError') {
    message    = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  // ── Mongoose: cast error (bad ObjectId) ────────────────────────────────
  if (err.name === 'CastError') {
    message    = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // ── JWT errors ─────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { message = 'Invalid token';  statusCode = 401; }
  if (err.name === 'TokenExpiredError')  { message = 'Token expired';  statusCode = 401; }
  if (err.name === 'NotBeforeError')     { message = 'Token not active yet'; statusCode = 401; }

  // ── Multer file size / type errors ─────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    message    = 'File too large. Check the size limit for this upload type.';
    statusCode = 413;
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message    = err.message || 'Unexpected file field or file type not allowed';
    statusCode = 400;
  }

  // ── Cloudinary errors ──────────────────────────────────────────────────
  if (err.http_code) {
    message    = err.message || 'Cloudinary upload failed';
    statusCode = err.http_code || 500;
  }

  // ── Console logging (always log server errors; skip 4xx in production) ─
  const timestamp = new Date().toISOString();
  const shouldLog = statusCode >= 500 || process.env.NODE_ENV !== 'production';

  if (shouldLog) {
    console.error(`\n❌ [ERROR] ${timestamp}`);
    console.error(`   Route   : ${req.method} ${req.originalUrl}`);
    console.error(`   Status  : ${statusCode}`);
    console.error(`   Message : ${message}`);
    if (req.user) {
      console.error(`   User    : ${req.user._id} (${req.user.role})`);
    }
    if (process.env.NODE_ENV !== 'production' && err.stack) {
      console.error(`   Stack   :\n${err.stack}`);
    }
    console.error('');
  } else {
    // In production, log 4xx as warnings (less noise)
    console.warn(`[WARN] ${timestamp} ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack only in development (never leak in production)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
