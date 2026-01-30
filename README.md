# Blink Detection React Component

A React-based web feature that detects when a user blinks using their webcam and changes website content accordingly. Built with MediaPipe FaceMesh for real-time facial landmark detection.

## 🚀 Features

- **Real-time Blink Detection**: Uses MediaPipe FaceMesh to detect eye blinks with high accuracy
- **Mobile Responsive**: Fully responsive design that works on all screen sizes (360px to desktop)
- **Privacy-First**: All processing happens client-side, no data leaves the device
- **Touch-Friendly UI**: Optimized for mobile devices with touch-friendly controls
- **Debug Mode**: Optional debug overlay showing eye landmarks and measurements
- **Error Handling**: Graceful fallbacks for camera permission issues

## 📱 Mobile Responsiveness

The component is designed to work seamlessly across all device sizes:

- **Small phones (≤360px)**: Compact layout with optimized touch targets
- **Standard smartphones (361px-768px)**: Portrait video orientation, stacked layout
- **Tablets and desktop (≥769px)**: Side-by-side video and content layout

## 🛠 Tech Stack

- **React 18**: Functional components with hooks
- **MediaPipe FaceMesh**: Real-time facial landmark detection (CDN-based)
- **WebRTC**: Camera access via `navigator.mediaDevices.getUserMedia`
- **CSS Grid/Flexbox**: Responsive layout system
- **No backend required**: Fully client-side implementation

## 📦 Installation & Setup

### Option 1: Standalone HTML (Quick Start)

1. Download `index.html` and open it in a web browser
2. Allow camera permissions when prompted
3. Blink to see the content change

### Option 2: React Project Integration

1. **Copy the component file**:
   ```bash
   cp BlinkDetector.js /path/to/your/react/src/components/
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install react@18.2.0 react-dom@18.2.0
   ```

3. **Add MediaPipe CDN to your public/index.html**:
   ```html
   <!-- Add these scripts to your public/index.html -->
   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
   <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossorigin="anonymous"></script>
   ```

4. **Import and use the component**:
   ```jsx
   import React from 'react';
   import BlinkDetector from './components/BlinkDetector';

   function App() {
     return (
       <div className="App">
         <BlinkDetector />
       </div>
     );
   }

   export default App;
   ```

5. **Start your React app**:
   ```bash
   npm start
   ```

## 🔧 Configuration

### Blink Detection Thresholds

You can adjust the blink detection sensitivity by modifying these constants in `BlinkDetector.js`:

```javascript
const BLINK_THRESHOLDS = {
  eyeAspectRatioThreshold: 0.25,  // Lower = more sensitive
  minBlinkDuration: 100,          // Minimum blink duration in ms
  cooldownPeriod: 500,             // Time between blinks in ms
  consecutiveFrames: 2,            // Frames below threshold to trigger
};
```

### Eye Landmark Indices

The component uses these MediaPipe FaceMesh landmarks:

```javascript
const LEFT_EYE_LANDMARKS = {
  top: 159,    // Upper eyelid center
  bottom: 145, // Lower eyelid center
  left: 33,    // Left corner
  right: 133,  // Right corner
};

const RIGHT_EYE_LANDMARKS = {
  top: 386,    // Upper eyelid center
  bottom: 374, // Lower eyelid center
  left: 362,   // Left corner
  right: 263,  // Right corner
};
```

## 🎯 How It Works

### 1. Camera Setup
- Requests camera permission with mobile-friendly constraints
- Uses front-facing camera (`facingMode: "user"`) on mobile devices
- Mirrors video feed for natural interaction

### 2. Face Detection
- MediaPipe FaceMesh detects 468 facial landmarks in real-time
- Processes only one face for optimal performance
- Configurable detection and tracking confidence thresholds

### 3. Blink Detection Algorithm
- Calculates Eye Aspect Ratio (EAR) for each eye
- EAR = (vertical eye distance) / (horizontal eye distance)
- Detects blink when EAR falls below threshold
- Validates with minimum duration and cooldown period

### 4. Content Switching
- Toggles between Content A and Content B on valid blink
- Includes visual feedback with status indicators
- Modular design allows easy extension

## 🎨 Customization

### Changing Content Behavior

Modify the content switching logic in the `onFaceMeshResults` function:

```javascript
if (isValidBlink) {
  setIsBlinkDetected(true);
  
  // Custom content switching logic
  setCurrentContent(prev => {
    switch(prev) {
      case 'A': return 'B';
      case 'B': return 'C';
      case 'C': return 'A';
      default: return 'A';
    }
  });
  
  // Or trigger custom actions
  // triggerCustomAction();
  
  blinkState.lastBlinkTime = currentTime;
  setTimeout(() => setIsBlinkDetected(false), 200);
}
```

### Styling Customization

The component uses inline styles with extensive mobile responsiveness. Key responsive breakpoints:

- `@media (max-width: 768px)`: Tablet and below
- `@media (max-width: 480px)`: Mobile phones
- `@media (max-width: 360px)`: Small phones

## 🔍 Debug Mode

Enable debug mode to see:
- Eye landmark positions (red for left eye, cyan for right eye)
- Real-time Eye Aspect Ratio values
- Visual feedback for detection accuracy

```javascript
const [showDebug, setShowDebug] = useState(false);
// Toggle via UI button or programmatically
```

## 🚨 Browser Compatibility

### Required Features
- **WebRTC**: `navigator.mediaDevices.getUserMedia`
- **MediaPipe**: Modern JavaScript with ES6+ features
- **CSS Grid/Flexbox**: For responsive layout

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

### Known Limitations
- Requires HTTPS in production (camera access requirement)
- Performance may vary on low-end devices
- Face detection works best with adequate lighting

## 🛡 Security & Privacy

- **Local Processing**: All face detection happens client-side
- **No Data Transmission**: Camera feed never leaves the device
- **Permission Model**: Explicit user consent required
- **Memory Management**: Proper cleanup on component unmount

## 🔄 Performance Optimization

### Mobile Optimizations
- Single face processing limit
- Disabled landmark refinement for better performance
- Optimized video constraints for mobile devices
- Efficient animation frame management

### Memory Management
- Proper stream cleanup on unmount
- FaceMesh instance cleanup
- Animation frame cancellation
- No memory leaks in React hooks

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser permissions
2. Ensure HTTPS in production
3. Try refreshing the page
4. Check if other apps are using the camera

### Blink Detection Not Accurate
1. Ensure good lighting conditions
2. Face should be clearly visible in camera
3. Adjust `eyeAspectRatioThreshold` sensitivity
4. Enable debug mode to see landmark detection

### Performance Issues
1. Close other browser tabs
2. Ensure single face in frame
3. Check device capabilities
4. Reduce video resolution if needed

## 📈 Advanced Features (Bonus)

### Double-Blink Detection
```javascript
// Add to blinkStateRef
doubleBlinkStartTime: 0,
doubleBlinkWindow: 800, // ms window for double blink

// In detection logic
if (currentTime - blinkState.lastBlinkTime < BLINK_THRESHOLDS.doubleBlinkWindow) {
  // Double blink detected
  triggerDoubleBlinkAction();
}
```

### Calibration Mode
```javascript
const [isCalibrating, setIsCalibrating] = useState(false);
const [userThreshold, setUserThreshold] = useState(0.25);

// Calibration logic to determine user's normal EAR range
const calibrateThreshold = () => {
  // Collect EAR samples over time
  // Calculate personalized threshold
};
```

## 📄 License

MIT License - feel free to use in commercial and personal projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Verify browser compatibility
3. Test with the standalone HTML version first
4. Review console logs for error messages

---

**Built with ❤️ for modern web experiences**
