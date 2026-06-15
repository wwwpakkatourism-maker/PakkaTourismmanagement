const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── API Routes ───────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leads',      require('./routes/leads'));
app.use('/api/quotes',     require('./routes/quotes'));
app.use('/api/pricing',    require('./routes/pricing'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/vendors',    require('./routes/vendors'));
app.use('/api/finance',    require('./routes/finance'));
app.use('/api/itinerary',  require('./routes/itinerary'));
app.use('/api/analytics',  require('./routes/analytics'));
app.use('/api/whatsapp',   require('./routes/whatsapp'));
app.use('/api/settings',   require('./routes/settings'));
app.use('/api/exports',    require('./routes/exports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Pakka Tourism CRM API', version: '1.0.0' });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Pakka Tourism CRM Server running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV}`);
  console.log(`   API:  http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
