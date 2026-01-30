const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/photos', express.static(path.join(__dirname, '../public/photos')));
app.use('/music', express.static(path.join(__dirname, '../public/music')));

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

// HTML content for the main page
const getHtmlContent = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LoveBlink - Emotional Blink Detection</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --rose-pink: #F8BBD0;
            --blush-pink: #F48FB1;
            --lavender: #E1BEE7;
            --peach: #FFCCBC;
            --gold: #FFD54F;
            --soft-red: #E57373;
            --off-white: #FFF7F9;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, var(--off-white) 0%, var(--rose-pink) 50%, var(--lavender) 100%);
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }
        
        .flip-card {
            background-color: transparent;
            width: 280px;
            height: 350px;
            perspective: 1000px;
            cursor: pointer;
        }
        
        .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            text-align: center;
            transition: transform 0.8s;
            transform-style: preserve-3d;
        }
        
        .flip-card.flipped .flip-card-inner {
            transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .flip-card-front {
            background: linear-gradient(135deg, var(--rose-pink), var(--blush-pink));
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .flip-card-back {
            background: linear-gradient(135deg, var(--lavender), var(--peach));
            color: #333;
            transform: rotateY(180deg);
            padding: 20px;
            font-size: 16px;
            font-weight: normal;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="min-h-screen flex flex-col items-center justify-center p-8">
        <div class="text-center mb-12">
            <h1 class="text-5xl md:text-6xl font-bold mb-6" style="font-family: 'Playfair Display', serif">
                Begin Your Journey 💕
            </h1>
            <p class="text-xl text-gray-700 mb-4">
                Flip each card to unlock the memories within
            </p>
            <p class="text-lg text-gray-600">
                Cards flipped: <span id="cardCount">0</span> / 5
            </p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            <div class="flip-card" onclick="flipCard(1)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💖</div>
                            <div>Soumya Dedh-</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-4xl mb-4">💭</div>
                            <p>pandurangwadi malum he??</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flip-card" onclick="flipCard(2)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💖</div>
                            <div>Alarm Mhatre</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-4xl mb-4">💭</div>
                            <p>mi mulund la rahto</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flip-card" onclick="flipCard(3)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💖</div>
                            <div>Vedika Vilas Tiger</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-4xl mb-4">💭</div>
                            <p>pen-fight kheltoy, khelnar tu pan?</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flip-card" onclick="flipCard(4)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💖</div>
                            <div>Shubra Acer-mall</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-4xl mb-4">💭</div>
                            <p>tune maths ka ssignment kia he toh bhej na</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flip-card" onclick="flipCard(5)">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💖</div>
                            <div>hilani</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-4xl mb-4">💭</div>
                            <p>tera parabola banake ho gya toh meko bhi bata na</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="completeMessage" class="mt-12 text-center hidden">
            <div class="inline-flex items-center space-x-2 bg-white bg-opacity-25 px-6 py-3 rounded-full">
                <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span class="text-lg font-semibold">All cards unlocked! 🎉</span>
            </div>
        </div>
    </div>
    
    <script>
        let flippedCards = new Set();
        
        function flipCard(cardNumber) {
            const card = document.querySelector(\`.flip-card:nth-child(\${cardNumber})\`);
            card.classList.toggle('flipped');
            
            if (flippedCards.has(cardNumber)) {
                flippedCards.delete(cardNumber);
            } else {
                flippedCards.add(cardNumber);
            }
            
            document.getElementById('cardCount').textContent = flippedCards.size;
            
            if (flippedCards.size === 5) {
                document.getElementById('completeMessage').classList.remove('hidden');
            }
        }
    </script>
</body>
</html>`;

// Main route - serve HTML
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getHtmlContent());
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch all for Vercel
app.all('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(getHtmlContent());
});

module.exports = app;
