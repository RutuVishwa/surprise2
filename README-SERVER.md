# Blink Detection React App with Node.js Server

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Allow camera permissions when prompted
   - Enable debug mode to see eye tracking

## 📁 Project Structure

```
blink-detection-server/
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── public/
│   └── index.html        # React app with MediaPipe
└── README-SERVER.md       # This file
```

## 🎯 Features

### Enhanced Debug Mode
- **Red border** around left eye with "LEFT EYE" label
- **Cyan border** around right eye with "RIGHT EYE" label  
- **Real-time EAR values** showing eye openness
- **Visual feedback** for eye tracking accuracy

### Blink Detection
- **Eye Aspect Ratio (EAR)** algorithm for accurate blink detection
- **Configurable thresholds** for sensitivity adjustment
- **Background color changes** on successful blinks
- **Console logging** for debugging

### Mobile Responsive
- **Touch-friendly UI** with 44px minimum touch targets
- **Responsive layout** for all screen sizes (360px+)
- **Portrait video** orientation for mobile devices
- **Flexible grid layout** that adapts to screen size

## 🔧 Configuration

### Blink Detection Thresholds
```javascript
const BLINK_THRESHOLDS = {
  eyeAspectRatioThreshold: 0.3,   // Below this = blink
  minBlinkDuration: 50,           // Minimum duration in ms
  cooldownPeriod: 300,             // Time between blinks
  consecutiveFrames: 1,            // Frames needed
};
```

### Eye Landmark Indices
- **Left Eye**: 159 (top), 145 (bottom), 33 (left), 133 (right)
- **Right Eye**: 386 (top), 374 (bottom), 362 (left), 263 (right)

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser console for errors
2. Ensure camera permissions are granted
3. Try refreshing the page
4. Check if other apps are using the camera

### Blink Detection Not Triggering
1. **Enable debug mode** - check if eye borders follow your eyes
2. **Check EAR values** - should drop when you blink
3. **Adjust lighting** - ensure good face visibility
4. **Verify console logs** - look for "TRIGGERING BLINK ACTION!"

### Performance Issues
1. Close other browser tabs
2. Ensure single face in camera view
3. Check device performance
4. Reduce video resolution if needed

## 🌐 Browser Support

### Required Features
- **WebRTC**: `navigator.mediaDevices.getUserMedia`
- **MediaPipe**: Modern JavaScript with ES6+
- **Canvas API**: For debug overlay rendering

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 10+)

## 🔒 Security & Privacy

- **Local Processing**: All face detection happens client-side
- **No Data Transmission**: Camera feed never leaves the device
- **HTTPS Required**: For production camera access
- **Permission Model**: Explicit user consent required

## 📱 Mobile Testing

### Recommended Testing
1. **Test on actual devices** (not just emulators)
2. **Check different orientations** (portrait/landscape)
3. **Verify touch targets** are accessible
4. **Test with various lighting conditions**

### iOS Specific
- Use Safari for best compatibility
- Ensure HTTPS in production
- Test camera permission flow

### Android Specific
- Chrome Mobile recommended
- Test front vs back camera behavior
- Verify performance on lower-end devices

## 🎨 Customization

### Adding New Actions
```javascript
if (isValidBlink) {
  // Custom action here
  triggerCustomFunction();
  
  // Change colors
  const customColors = ['#ff0000', '#00ff00', '#0000ff'];
  setBackgroundColor(customColors[Math.floor(Math.random() * customColors.length)]);
}
```

### Modifying Thresholds
Adjust `BLINK_THRESHOLDS` in the component for different sensitivity:
- **Lower threshold** = more sensitive
- **Higher threshold** = less sensitive
- **Shorter duration** = faster detection
- **Longer cooldown** = fewer false positives

## 📊 Monitoring

### Console Logs
The app provides detailed console logging:
- Camera initialization status
- Face detection results
- EAR values in real-time
- Blink detection events
- Performance metrics

### Debug Overlay
When enabled, shows:
- Eye landmark positions
- Eye border tracking
- Real-time measurements
- Threshold comparisons

## 🚀 Deployment

### Production Setup
1. **Set environment variables:**
   ```bash
   export PORT=3000
   export NODE_ENV=production
   ```

2. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "blink-detection"
   ```

3. **Configure reverse proxy** (nginx/Apache) for HTTPS

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

**Built with ❤️ for modern web experiences**
