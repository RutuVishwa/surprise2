import json
import os

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
    
    # Get photo files - use a simpler approach
    photo_files = []
    try:
        # Try multiple possible paths
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "..", "public", "photos"),
            "/var/task/public/photos",
            "public/photos",
            "./public/photos"
        ]
        
        for photos_dir in possible_paths:
            if os.path.exists(photos_dir):
                photo_files = sorted(
                    [f for f in os.listdir(photos_dir) if f.endswith(('.jpg', '.jpeg'))],
                    key=lambda x: int(x.split('.')[0]) if x.split('.')[0].isdigit() else 999
                )
                if photo_files:
                    break
                    
    except Exception as e:
        print(f"Error loading photos: {e}")
        photo_files = []
    
    # If no photos found, create placeholder list
    if not photo_files:
        photo_files = [f"{i}.jpeg" for i in range(1, 26)]
    
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
        
        elif path == "/" or path == "":
            # Serve the main HTML file
            try:
                # Try multiple possible paths for the HTML file
                html_paths = [
                    os.path.join(os.path.dirname(__file__), "..", "templates", "index.html"),
                    "/var/task/templates/index.html",
                    "templates/index.html",
                    "./templates/index.html"
                ]
                
                html_content = None
                for html_path in html_paths:
                    if os.path.exists(html_path):
                        with open(html_path, "r") as f:
                            html_content = f.read()
                        break
                
                if html_content:
                    return {
                        "statusCode": 200,
                        "headers": {
                            "Content-Type": "text/html"
                        },
                        "body": html_content
                    }
                else:
                    return {
                        "statusCode": 404,
                        "headers": {
                            "Content-Type": "text/plain"
                        },
                        "body": "Index page not found - tried multiple paths"
                    }
            except Exception as e:
                return {
                    "statusCode": 500,
                    "headers": {
                        "Content-Type": "text/plain"
                    },
                    "body": f"Error serving index page: {str(e)}"
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
        "headers": {
            "Content-Type": "text/plain"
        },
        "body": f"Not found: {request.method} {request.path}"
    }
