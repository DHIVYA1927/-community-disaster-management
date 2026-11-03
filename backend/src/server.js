require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const disasterRoutes = require('./routes/disasterRoutes');
const emergencyRequestRoutes = require('./routes/emergencyRequestRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const resourceAllocationRoutes = require('./routes/resourceAllocationRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const geocodeRoutes = require('./routes/geocodeRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Community Disaster Management and Resource Allocation API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/emergency-requests', emergencyRequestRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/allocations', resourceAllocationRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/geocode', geocodeRoutes);

// Serve static frontend build
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
console.log(`[Server] Frontend build directory: ${frontendDist} (exists: ${fs.existsSync(frontendDist)})`);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send('<h1>Community Disaster Management API is Live!</h1><p>Frontend build was not found. Health check: <a href="/api/health">/api/health</a></p>');
  });
}

// Error Handling Middleware for API
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`[Server] Community Disaster Management Server running on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    console.log(`[Server] Frontend served at: http://localhost:${PORT}/ and http://localhost:5173/`);
  });
}

module.exports = app;
