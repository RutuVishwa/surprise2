const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory and photos folder
app.use(express.static(__dirname));
app.use('/photos', express.static(path.join(__dirname, 'photos')));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// API endpoint for blink detection status (simulated)
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ready',
        message: 'Love detection system is ready 💕',
        timestamp: new Date().toISOString(),
        photos: getPhotoCount()
    });
});

// API endpoint for manual blink trigger
app.post('/api/blink', express.json(), (req, res) => {
    console.log('💕 Manual blink detected!');
    res.json({
        success: true,
        message: 'Love moment created! 💝',
        timestamp: new Date().toISOString()
    });
});

// Serve Navigation Hub (Main Entry Point)
app.get('/nav', (req, res) => {
    const filePath = path.join(__dirname, 'nav.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Navigation page not found 💔');
    }
});

// Serve Love Landing Page
app.get('/love', (req, res) => {
    const filePath = path.join(__dirname, 'love-index.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Love page not found 💔');
    }
});

// Serve Blink Experience Page
app.get('/experience', (req, res) => {
    const filePath = path.join(__dirname, 'experience.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Experience page not found 💔');
    }
});

// Serve Original Demo (Public folder)
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        // Fallback to nav.html if public/index.html doesn't exist
        const navPath = path.join(__dirname, 'nav.html');
        if (fs.existsSync(navPath)) {
            res.sendFile(navPath);
        } else {
            res.status(404).send('Main page not found 💔');
        }
    }
});

// Serve simple test page
app.get('/simple', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'simple.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Simple page not found 💔');
    }
});

// Serve fallback page
app.get('/fallback', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'fallback.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Fallback page not found 💔');
    }
});

// Helper function to count photos
function getPhotoCount() {
    try {
        const photosDir = path.join(__dirname, 'photos');
        if (fs.existsSync(photosDir)) {
            const files = fs.readdirSync(photosDir);
            return files.filter(file => /\.(jpg|jpeg)$/i.test(file)).length;
        }
    } catch (error) {
        console.error('Error counting photos:', error);
    }
    return 0;
}

// Add detailed request logging with love theme
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const loveEmojis = ['💕', '💝', '💖', '💗', '💓', '💞'];
    const randomEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
    console.log(`${timestamp} - ${req.method} ${req.url} ${randomEmoji}`);
    next();
});

// Welcome middleware for specific routes
app.use(['/nav', '/love', '/experience'], (req, res, next) => {
    console.log(`🌸 Someone is entering the love experience: ${req.url}`);
    next();
});

// Basic error handling middleware with love theme
app.use((err, req, res, next) => {
    console.error('💔 SERVER ERROR:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).send('💔 Something broke in the love server!');
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

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n💕 Shutting down the love server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n💝 Love server received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start the server with error handling and love theme
try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('');
        console.log('🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕');
        console.log('     💕 LOVEBLINK SERVER IS RUNNING 💕');
        console.log('🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕🌸💕');
        console.log('');
        console.log(`🚀 Server running at: http://localhost:${PORT}`);
        console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
        console.log('');
        console.log('📱 Available Pages:');
        console.log(`   🏠 Navigation Hub: http://localhost:${PORT}/nav`);
        console.log(`   💕 Love Landing:  http://localhost:${PORT}/love`);
        console.log(`   👁️ Blink Experience: http://localhost:${PORT}/experience`);
        console.log(`   🎯 Original Demo:  http://localhost:${PORT}/`);
        console.log(`   🔧 Simple Test:    http://localhost:${PORT}/simple`);
        console.log('');
        console.log('📹 Don\'t forget to allow camera permissions! 📸');
        console.log('💕 Made with love for human connections 💕');
        console.log('');
        
        // Log photo count
        const photoCount = getPhotoCount();
        console.log(`📸 Found ${photoCount} photos in the gallery`);
        if (photoCount > 0) {
            console.log('✨ Your photo gallery is ready for love moments!');
        } else {
            console.log('⚠️  No photos found - add some to the photos folder!');
        }
        console.log('');
    });
} catch (error) {
    console.error('💥 FAILED TO START LOVE SERVER:', error);
    process.exit(1);
}
