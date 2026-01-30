const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve simple test page
app.get('/simple', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simple.html'));
});

// Serve fallback page
app.get('/fallback', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fallback.html'));
});

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).send('Something broke on the server!');
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
  console.error('Reason details:', reason);
});

// Catch uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1); // Exit to avoid undefined state
});

// Start the server with error handling
try {
  app.listen(PORT, () => {
    console.log('🚀 Blink Detection App running at http://localhost:' + PORT);
    console.log('📹 Open your browser and navigate to the above URL');
    console.log('🎯 Make sure to allow camera permissions when prompted');
    console.log('🔍 Check browser console (F12) for MediaPipe loading details');
  });
} catch (error) {
  console.error('💥 FAILED TO START SERVER:', error);
  process.exit(1);
}
