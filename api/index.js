const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Special text memories
const textMemories = [
    "there is no easy way to say this",
    "but",
    "it is over right??",
    "from shubra ki train miss to the anvesh 26",
    "all the moments we lived in these 3 years",
    "memories that i will treasure forever",
    "but those days will be behind us, after sometime",
    "of course not all memories are great",
    "but those represent us",
    "maybe it represents that no one is 100 percent perfect but when we meet each other we completely forget about the defects",
    "of course we were not that great of a group",
    "but",
    "i just want you to know that you guys mean alot to me even more than my family maybe",
    "and i will do anything in my power to keep shitposting alive till the end",
    "i just wish there was a button like the one you are clicking right now",
    "so that i would never press it",
    "just to live in a particular momment for lifetime",
    "but if it was there",
    "we would have never seen what else life had to offer",
    "alas!! we may or may not meet after these few days",
    "Guess we have to find out",
    "till then take care",
    "and dont you dare forget this group",
    "else",
    "i will come to your house and personally remind you of it",
    "in the end",
    "just remember 2 things",
    "1. woh aunty  jiska phone escalator se gira tha uska phone abhi bhi damaged he ",
    "and",
    "2. Jai Shree Allah",
    "bye"
];

// Global state
let currentPhotoIndex = 0;
let lastBlinkTime = 0;
const totalRegularPhotos = 25;

// Helper function to get photo files
function getPhotoFiles() {
    const photosDir = path.join(__dirname, '../public/photos');
    try {
        const files = fs.readdirSync(photosDir)
            .filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg'))
            .sort((a, b) => {
                const numA = parseInt(a.split('.')[0]) || 999;
                const numB = parseInt(b.split('.')[0]) || 999;
                return numA - numB;
            });
        return files;
    } catch (error) {
        console.error('Error reading photos directory:', error);
        return [];
    }
}

// Routes
app.get('/', (req, res) => {
    try {
        const indexPath = path.join(__dirname, '../templates/index.html');
        res.sendFile(indexPath);
    } catch (error) {
        res.status(404).send('Index page not found');
    }
});

app.get('/nav', (req, res) => {
    try {
        const navPath = path.join(__dirname, '../nav.html');
        res.sendFile(navPath);
    } catch (error) {
        res.status(404).send('Navigation page not found');
    }
});

app.get('/love', (req, res) => {
    try {
        const lovePath = path.join(__dirname, '../love-index.html');
        res.sendFile(lovePath);
    } catch (error) {
        res.status(404).send('Love page not found');
    }
});

app.get('/experience', (req, res) => {
    try {
        const experiencePath = path.join(__dirname, '../experience.html');
        res.sendFile(experiencePath);
    } catch (error) {
        res.status(404).send('Experience page not found');
    }
});

// API Routes
app.get('/api/get_status', (req, res) => {
    const photoFiles = getPhotoFiles();
    const totalMemories = totalRegularPhotos + textMemories.length;
    
    let currentPhotoName = "";
    if (currentPhotoIndex < totalRegularPhotos) {
        // Regular photo
        if (photoFiles && currentPhotoIndex < photoFiles.length) {
            currentPhotoName = photoFiles[currentPhotoIndex];
        }
    } else {
        // Text memory
        currentPhotoName = `text_memory_${currentPhotoIndex}`;
    }
    
    res.json({
        content: 'A',
        currentPhotoIndex: currentPhotoIndex,
        currentPhotoName: currentPhotoName,
        totalPhotos: totalMemories,
        blinkDetected: false
    });
});

app.post('/api/manual_blink', (req, res) => {
    const currentTime = Date.now();
    if (currentTime - lastBlinkTime > 500) { // 500ms cooldown
        const totalMemories = totalRegularPhotos + textMemories.length;
        currentPhotoIndex = (currentPhotoIndex + 1) % totalMemories;
        lastBlinkTime = currentTime;
        
        const photoFiles = getPhotoFiles();
        let currentPhotoName = "";
        if (currentPhotoIndex < totalRegularPhotos) {
            if (photoFiles && currentPhotoIndex < photoFiles.length) {
                currentPhotoName = photoFiles[currentPhotoIndex];
            }
        } else {
            currentPhotoName = `text_memory_${currentPhotoIndex}`;
        }
        
        console.log(`🎯 MANUAL BLINK! Switching to memory ${currentPhotoIndex + 1}: ${currentPhotoName}`);
        
        res.json({
            success: true,
            content: 'A',
            currentPhotoIndex: currentPhotoIndex,
            currentPhotoName: currentPhotoName,
            totalPhotos: totalMemories
        });
    } else {
        res.status(429).json({
            success: false,
            message: 'Too soon! Please wait.'
        });
    }
});

// Serve static files
app.use('/photos', express.static(path.join(__dirname, '../public/photos')));
app.use('/music', express.static(path.join(__dirname, '../public/music')));

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch all handler for Vercel
app.all('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Love Blink Detection Server running on port ${PORT}`);
        console.log(`🎯 Navigate to http://localhost:${PORT}`);
        console.log(`📁 Photos directory: ${path.join(__dirname, '../public/photos')}`);
        console.log(`🎵 Music directory: ${path.join(__dirname, '../public/music')}`);
    });
}

module.exports = app;
