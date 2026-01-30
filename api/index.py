import json

# Special text memories
text_memories = [
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
]

# Global state
current_photo_index = 0
last_blink_time = 0
total_regular_photos = 25

def handler(request):
    global current_photo_index, last_blink_time
    
    # Get the path from the request
    path = request.path if hasattr(request, 'path') else '/'
    method = request.method if hasattr(request, 'method') else 'GET'
    
    # Handle different routes
    if method == "GET":
        if path == '/get_status':
            total_memories = total_regular_photos + len(text_memories)
            current_photo_name = ""
            
            if current_photo_index < total_regular_photos:
                current_photo_name = f"{current_photo_index + 1}.jpeg"
            else:
                current_photo_name = f"text_memory_{current_photo_index}"
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "content": "A",
                    "currentPhotoIndex": current_photo_index,
                    "currentPhotoName": current_photo_name,
                    "totalPhotos": total_memories,
                    "blinkDetected": False
                })
            }
        
        elif path == '/' or path == '':
            # Serve HTML
            html_content = '''<!DOCTYPE html>
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
            const card = document.querySelector(`.flip-card:nth-child(${cardNumber})`);
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
</html>'''
            
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "text/html",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": html_content
            }
    
    elif method == "POST":
        if path == '/manual_blink':
            import time
            current_time = int(time.time() * 1000)
            
            if current_time - last_blink_time > 500:
                total_memories = total_regular_photos + len(text_memories)
                current_photo_index = (current_photo_index + 1) % total_memories
                last_blink_time = current_time
                
                current_photo_name = ""
                if current_photo_index < total_regular_photos:
                    current_photo_name = f"{current_photo_index + 1}.jpeg"
                else:
                    current_photo_name = f"text_memory_{current_photo_index}"
                
                return {
                    "statusCode": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({
                        "success": True,
                        "content": "A",
                        "currentPhotoIndex": current_photo_index,
                        "currentPhotoName": current_photo_name,
                        "totalPhotos": total_memories
                    })
                }
            else:
                return {
                    "statusCode": 429,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({
                        "success": False,
                        "message": "Too soon! Please wait."
                    })
                }
    
    # Handle CORS preflight
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    
    return {
        "statusCode": 404,
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": f"Not found: {method} {path}"
    }
