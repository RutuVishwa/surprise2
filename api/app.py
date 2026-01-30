import json
import os
from pathlib import Path

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

# Global state (in production, you'd use a database)
current_photo_index = 0
last_blink_time = 0
total_regular_photos = 25

def handler(request):
    global current_photo_index, last_blink_time
    
    # Get photo files
    photos_dir = Path(__file__).parent.parent / "public" / "photos"
    try:
        photo_files = sorted(
            [f.name for f in photos_dir.glob("*.jpg") + photos_dir.glob("*.jpeg")],
            key=lambda x: int(x.split('.')[0]) if x.split('.')[0].isdigit() else 999
        )
    except:
        photo_files = []
    
    # Handle different routes
    if request.method == "GET":
        path = request.path
        
        if path == "/get_status":
            total_memories = total_regular_photos + len(text_memories)
            current_photo_name = ""
            
            if current_photo_index < total_regular_photos:
                if photo_files and current_photo_index < len(photo_files):
                    current_photo_name = photo_files[current_photo_index]
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
        
        elif path == "/":
            # Serve the main HTML file
            try:
                with open(Path(__file__).parent.parent / "templates" / "index.html", "r") as f:
                    html_content = f.read()
                return {
                    "statusCode": 200,
                    "headers": {
                        "Content-Type": "text/html"
                    },
                    "body": html_content
                }
            except FileNotFoundError:
                return {
                    "statusCode": 404,
                    "body": "Index page not found"
                }
    
    elif request.method == "POST":
        if request.path == "/manual_blink":
            import time
            current_time = int(time.time() * 1000)
            
            if current_time - last_blink_time > 500:  # 500ms cooldown
                total_memories = total_regular_photos + len(text_memories)
                current_photo_index = (current_photo_index + 1) % total_memories
                last_blink_time = current_time
                
                current_photo_name = ""
                if current_photo_index < total_regular_photos:
                    if photo_files and current_photo_index < len(photo_files):
                        current_photo_name = photo_files[current_photo_index]
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
    if request.method == "OPTIONS":
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
        "body": "Not found"
    }
