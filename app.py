from flask import Flask, render_template, Response, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import threading
import time
import json
import os
import glob

app = Flask(__name__)
CORS(app)

# Special text messages for memories
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

# Total memories = regular photos + text memories
total_regular_photos = 25    # Photos 1-25

# Global variables
camera = None
blink_detected = False
last_blink_time = 0
current_content = 'A'
current_photo_index = 0
photos_folder = os.path.join(os.path.dirname(__file__), 'public', 'photos')
print(f"📁 Photos folder path: {photos_folder}")
print(f"📁 Photos folder exists: {os.path.exists(photos_folder)}")
photo_files = []  # Will be populated with actual photo paths
background_colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']
current_bg_color = background_colors[0]

def load_photo_files():
    """Load and sort photo files from the photos folder"""
    global photo_files
    try:
        # Get all jpg/jpeg files in photos folder
        photo_pattern = os.path.join(photos_folder, '*.[jJ][pP][gG]')
        print(f"🔍 Photo pattern: {photo_pattern}")
        photo_files = glob.glob(photo_pattern)
        print(f"🔍 Raw glob results: {photo_files}")
        
        # Also try with different patterns
        if not photo_files:
            photo_pattern2 = os.path.join(photos_folder, '*.jpg')
            photo_files = glob.glob(photo_pattern2)
            print(f"🔍 Trying pattern2: {photo_pattern2}, found: {len(photo_files)}")
        
        if not photo_files:
            photo_pattern3 = os.path.join(photos_folder, '*.jpeg')
            photo_files = glob.glob(photo_pattern3)
            print(f"🔍 Trying pattern3: {photo_pattern3}, found: {len(photo_files)}")
        
        if not photo_files:
            # List all files in directory
            all_files = os.listdir(photos_folder)
            print(f"🔍 All files in directory: {all_files}")
            # Filter manually
            photo_files = [os.path.join(photos_folder, f) for f in all_files if f.lower().endswith(('.jpg', '.jpeg'))]
            print(f"🔍 Manual filter results: {photo_files}")
        
        # Sort files numerically (1.jpeg, 2.jpeg, etc.)
        def extract_number(filename):
            try:
                base = os.path.basename(filename)
                number = int(base.split('.')[0])
                return number
            except:
                return 999  # Put non-numeric files at the end
        photo_files.sort(key=extract_number)
        
        print(f"📁 Found {len(photo_files)} photo files: {[os.path.basename(f) for f in photo_files]}")
        
        # Check if photos exist and create missing ones
        existing_files = set()
        for filename in photo_files:
            existing_files.add(os.path.basename(filename))
            if not os.path.exists(filename):
                print(f"⚠️ WARNING: Photo {filename} does not exist, creating placeholder...")
                try:
                    # Create a proper 400x300 placeholder image
                    from PIL import Image
                    img = Image.new('RGB', (400, 300), color=(73, 80, 227))
                    img.save(filename, 'JPEG', quality=95)
                    print(f"✅ Created placeholder: {filename}")
                except Exception as e:
                    print(f"❌ Error creating placeholder {filename}: {e}")
        
        # Also check for missing photos 1-9 and create them
        for i in range(1, 10):
            expected_filename = f"{i}.jpeg"
            if expected_filename not in existing_files:
                placeholder_path = os.path.join(photos_folder, expected_filename)
                try:
                    # Create a proper 400x300 placeholder image with gradient
                    from PIL import Image, ImageDraw, ImageFont
                    img = Image.new('RGB', (400, 300), color=(248, 187, 208))  # Rose pink background
                    
                    # Add a gradient effect
                    draw = ImageDraw.Draw(img)
                    for y in range(300):
                        color = (
                            248 - int(y * 0.1),  # Red decreases
                            187 + int(y * 0.1),  # Green increases  
                            208 + int(y * 0.05)   # Blue increases slightly
                        )
                        draw.line([(0, y), (400, y)], fill=color)
                    
                    # Add text
                    try:
                        # Try to use a nice font
                        font = ImageFont.truetype("arial.ttf", 40)
                        small_font = ImageFont.truetype("arial.ttf", 20)
                    except:
                        # Fallback to default font
                        font = ImageFont.load_default()
                        small_font = ImageFont.load_default()
                    
                    # Add heart symbol and text
                    draw.text((200, 100), "💕", fill=(255, 255, 255), font=font, anchor="mm")
                    draw.text((200, 150), f"Photo {i}", fill=(255, 255, 255), font=small_font, anchor="mm")
                    draw.text((200, 180), "Beautiful Memory", fill=(255, 255, 255), font=small_font, anchor="mm")
                    
                    img.save(placeholder_path, 'JPEG', quality=95)
                    print(f"✅ Created beautiful placeholder: {placeholder_path}")
                except Exception as e:
                    print(f"❌ Error creating placeholder {expected_filename}: {e}")
        
        # Fix corrupted photos 44-50
        for i in range(44, 51):
            expected_filename = f"{i}.jpeg"
            placeholder_path = os.path.join(photos_folder, expected_filename)
            if os.path.exists(placeholder_path) and os.path.getsize(placeholder_path) < 1000:
                try:
                    # Recreate with beautiful gradient
                    from PIL import Image, ImageDraw, ImageFont
                    img = Image.new('RGB', (400, 300), color=(225, 190, 231))  # Lavender background
                    
                    draw = ImageDraw.Draw(img)
                    for y in range(300):
                        color = (
                            225 + int(y * 0.05),
                            190 + int(y * 0.05), 
                            231 - int(y * 0.05)
                        )
                        draw.line([(0, y), (400, y)], fill=color)
                    
                    try:
                        font = ImageFont.truetype("arial.ttf", 40)
                        small_font = ImageFont.truetype("arial.ttf", 20)
                    except:
                        font = ImageFont.load_default()
                        small_font = ImageFont.load_default()
                    
                    draw.text((200, 100), "🌸", fill=(255, 255, 255), font=font, anchor="mm")
                    draw.text((200, 150), f"Photo {i}", fill=(255, 255, 255), font=small_font, anchor="mm")
                    draw.text((200, 180), "Spring Memory", fill=(255, 255, 255), font=small_font, anchor="mm")
                    
                    img.save(placeholder_path, 'JPEG', quality=95)
                    print(f"✅ Fixed corrupted photo: {placeholder_path}")
                except Exception as e:
                    print(f"❌ Error fixing photo {expected_filename}: {e}")
        
        print(f"📁 Loaded {len(photo_files)} photos: {[os.path.basename(f) for f in photo_files]}")
        return True
    except Exception as e:
        print(f"❌ Error loading photos: {e}")
        photo_files = []
        return False

# Load photos after defining function
print("📁 Loading photos...", False)
load_photo_files()

class BlinkDetector:
    def __init__(self):
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        self.previous_frame = None
        self.blink_threshold = 0.1  # Very low threshold
        self.cooldown_period = 200  # Very short cooldown
        self.frame_count = 0
        self.eyes_closed_frames = 0  # Track consecutive frames with eyes closed
        self.eyes_open_frames = 0    # Track consecutive frames with eyes open
        
    def detect_blink(self, frame):
        global blink_detected, last_blink_time, current_content, current_photo_index, photo_files
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        self.frame_count += 1
        
        # Detect eyes
        eyes = self.eye_cascade.detectMultiScale(gray, 1.1, 4)
        
        current_time = int(time.time() * 1000)
        
        # NEW LOGIC: Detect blink when eyes disappear (closed)
        if len(eyes) == 0:
            self.eyes_closed_frames += 1
            self.eyes_open_frames = 0
            
            # Trigger blink if eyes have been closed for at least 3 frames and cooldown passed
            if self.eyes_closed_frames >= 3 and (current_time - last_blink_time) > self.cooldown_period:
                blink_detected = True
                last_blink_time = current_time
                
                # Switch to next memory (not just photo)
                total_memories = total_regular_photos + len(text_memories)
                current_photo_index = (current_photo_index + 1) % total_memories
                
                # Get current memory info
                if current_photo_index < total_regular_photos:
                    # Regular photo
                    if photo_files and current_photo_index < len(photo_files):
                        current_photo_path = photo_files[current_photo_index]
                        print(f"🎯 BLINK DETECTED! (Eyes Closed - {self.eyes_closed_frames} frames)")
                        print(f"📸 Switching to photo {current_photo_index + 1}: {os.path.basename(current_photo_path)}")
                    else:
                        print(f"🎯 BLINK DETECTED! (Eyes Closed - {self.eyes_closed_frames} frames)")
                        print(f"📸 Photo {current_photo_index + 1} not found, skipping...")
                else:
                    # Text memory
                    text_index = current_photo_index - total_regular_photos
                    if text_index < len(text_memories):
                        print(f"🎯 BLINK DETECTED! (Eyes Closed - {self.eyes_closed_frames} frames)")
                        print(f"💭 Switching to text memory {current_photo_index + 1}: {text_memories[text_index][:50]}...")
                
                return True, 0, eyes # Return motion as 0 since no eyes to calculate motion
                
        else:
            # Eyes are detected (open)
            self.eyes_open_frames += 1
            if self.eyes_closed_frames > 0:
                # Eyes just reopened after being closed
                print(f"👀 Eyes reopened after {self.eyes_closed_frames} frames closed")
            self.eyes_closed_frames = 0
            
            # Original motion-based detection as backup
            if self.previous_frame is not None and self.frame_count % 2 == 0:
                diff = cv2.absdiff(gray, self.previous_frame)
                motion_score = np.mean(diff) / 255.0
                
                if self.frame_count % 30 == 0:
                    print(f"Frame {self.frame_count}: Motion = {motion_score:.4f}, Eyes = {len(eyes)}")
                
                # Backup motion detection
                if motion_score > self.blink_threshold and (current_time - last_blink_time) > self.cooldown_period:
                    blink_detected = True
                    last_blink_time = current_time
                    
                    # Switch to next memory (not just photo)
                    total_memories = total_regular_photos + len(text_memories)
                    current_photo_index = (current_photo_index + 1) % total_memories
                    
                    # Get current memory info
                    if current_photo_index < total_regular_photos:
                        # Regular photo
                        if photo_files and current_photo_index < len(photo_files):
                            current_photo_path = photo_files[current_photo_index]
                            print(f"🎯 BLINK DETECTED! (Motion: {motion_score:.4f})")
                            print(f"📸 Switching to photo {current_photo_index + 1}: {os.path.basename(current_photo_path)}")
                        else:
                            print(f"🎯 BLINK DETECTED! (Motion: {motion_score:.4f})")
                            print(f"📸 Photo {current_photo_index + 1} not found, skipping...")
                    else:
                        # Text memory
                        text_index = current_photo_index - total_regular_photos
                        if text_index < len(text_memories):
                            print(f"🎯 BLINK DETECTED! (Motion: {motion_score:.4f})")
                            print(f"💭 Switching to text memory {current_photo_index + 1}: {text_memories[text_index][:50]}...")
                    
                    return True, motion_score, eyes
            
            # Update previous frame every few frames
            if self.frame_count % 3 == 0:
                self.previous_frame = gray.copy()
        
        return False, 0, eyes

# Initialize blink detector
blink_detector = BlinkDetector()

def generate_frames():
    global camera, blink_detected
    
    if camera is None:
        camera = cv2.VideoCapture(0)
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Mirror the frame for natural interaction
        frame = cv2.flip(frame, 1)
        
        # Detect blink
        is_blink, motion_score, eyes = blink_detector.detect_blink(frame)
        
        # Draw eye rectangles
        for (x, y, w, h) in eyes:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "EYE", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Draw motion score and debug info
        cv2.putText(frame, f"Motion: {motion_score:.4f}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"Threshold: {blink_detector.blink_threshold}", (10, 55), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        cv2.putText(frame, f"Eyes: {len(eyes)}", (10, 75), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        cv2.putText(frame, f"Frame: {blink_detector.frame_count}", (10, 95), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Show eye state
        if len(eyes) == 0:
            cv2.putText(frame, "EYES CLOSED", (10, 115), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            cv2.putText(frame, f"Closed frames: {blink_detector.eyes_closed_frames}", (10, 135), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        else:
            cv2.putText(frame, "EYES OPEN", (10, 115), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Draw blink indicator
        if is_blink:
            cv2.putText(frame, "BLINK DETECTED!", (10, 160), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Reset blink flag after a short time
        if blink_detected:
            time.sleep(0.1)
            blink_detected = False
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/health')
def health_check():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'timestamp': time.time(),
        'service': 'blink-detection-api',
        'version': '1.0.0',
        'photos_loaded': len(photo_files)
    })

@app.route('/')
def index():
    """Serve the React frontend as a static file to avoid Jinja2 parsing"""
    try:
        with open('templates/index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Index page not found", 404

@app.route('/nav')
def nav():
    """Serve the navigation hub page"""
    try:
        with open('nav.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Navigation page not found", 404

@app.route('/love')
def love():
    """Serve the beautiful love-themed landing page"""
    try:
        with open('love-index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Love page not found", 404

@app.route('/experience')
def experience():
    """Serve the blink detection experience page"""
    try:
        with open('experience.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Experience page not found", 404

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/photos/<filename>')
def serve_photo(filename):
    """Serve photo files from the photos folder"""
    try:
        return send_from_directory(photos_folder, filename)
    except Exception as e:
        print(f"❌ Error serving photo {filename}: {e}")
        return "Photo not found", 404

@app.route('/music/<filename>')
def serve_music(filename):
    """Serve music files from the music folder"""
    try:
        music_folder = os.path.join(os.getcwd(), 'music')
        return send_from_directory(music_folder, filename)
    except Exception as e:
        print(f"❌ Error serving music {filename}: {e}")
        return "Music file not found", 404

@app.route('/get_status')
def get_status():
    global current_content, current_photo_index, photo_files, blink_detected
    
    # Get current photo info
    current_photo_name = ""
    total_memories = total_regular_photos + len(text_memories)
    
    if current_photo_index < total_regular_photos:
        # Regular photo
        if photo_files and current_photo_index < len(photo_files):
            current_photo_name = os.path.basename(photo_files[current_photo_index])
    else:
        # Text memory
        current_photo_name = f"text_memory_{current_photo_index}"
    
    return jsonify({
        'content': current_content,
        'currentPhotoIndex': current_photo_index,
        'currentPhotoName': current_photo_name,
        'totalPhotos': total_memories,
        'blinkDetected': blink_detected
    })

@app.route('/manual_blink', methods=['POST'])
def manual_blink():
    global current_content, current_photo_index, photo_files, last_blink_time
    
    current_time = int(time.time() * 1000)
    if (current_time - last_blink_time) > 500:  # 500ms cooldown
        # Switch to next memory
        total_memories = total_regular_photos + len(text_memories)
        current_photo_index = (current_photo_index + 1) % total_memories
        last_blink_time = current_time
        blink_detected = True
        
        # Get current memory name
        current_photo_name = ""
        if current_photo_index < total_regular_photos:
            # Regular photo
            if photo_files and current_photo_index < len(photo_files):
                current_photo_name = os.path.basename(photo_files[current_photo_index])
        else:
            # Text memory
            current_photo_name = f"text_memory_{current_photo_index}"
        
        print(f"🎯 MANUAL BLINK! Switching to memory {current_photo_index + 1}: {current_photo_name}")
        
        return jsonify({
            'success': True,
            'content': current_content,
            'currentPhotoIndex': current_photo_index,
            'currentPhotoName': current_photo_name,
            'totalPhotos': total_memories
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Too soon! Please wait.'
        }), 429

if __name__ == '__main__':
    print("🚀 Starting Blink Detection Server with OpenCV")
    print("📹 OpenCV-based blink detection")
    print("🎯 Navigate to http://localhost:5000")
    
    try:
        # Use environment variable for port, default to 5000
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    except KeyboardInterrupt:
        print("\n👋 Shutting down server...")
        if camera:
            camera.release()
        cv2.destroyAllWindows()
