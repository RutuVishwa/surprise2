import React, { useEffect, useRef, useState, useCallback } from 'react';

// MediaPipe FaceMesh configuration
const FACE_MESH_CONFIG = {
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
};

// Eye landmark indices for MediaPipe FaceMesh
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

// Blink detection thresholds
const BLINK_THRESHOLDS = {
  eyeAspectRatioThreshold: 0.25,  // Below this value = blink
  minBlinkDuration: 100,          // Minimum duration in ms
  cooldownPeriod: 500,             // Cooldown between blinks in ms
  consecutiveFrames: 2,            // Consecutive frames below threshold
};

const BlinkDetector = () => {
  // Refs for DOM elements and MediaPipe
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // State management
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isBlinkDetected, setIsBlinkDetected] = useState(false);
  const [currentContent, setCurrentContent] = useState('A');
  const [permissionStatus, setPermissionStatus] = useState('prompting');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  
  // Blink detection state
  const blinkStateRef = useRef({
    isBlinking: false,
    blinkStartTime: 0,
    lastBlinkTime: 0,
    consecutiveBlinks: 0,
    leftEyeOpenness: 0,
    rightEyeOpenness: 0,
  });

  // Calculate Eye Aspect Ratio (EAR) for blink detection
  const calculateEyeAspectRatio = useCallback((landmarks, eyeLandmarks) => {
    const top = landmarks[eyeLandmarks.top];
    const bottom = landmarks[eyeLandmarks.bottom];
    const left = landmarks[eyeLandmarks.left];
    const right = landmarks[eyeLandmarks.right];
    
    // Vertical eye distance
    const verticalDistance = Math.sqrt(
      Math.pow(top.x - bottom.x, 2) + Math.pow(top.y - bottom.y, 2)
    );
    
    // Horizontal eye distance
    const horizontalDistance = Math.sqrt(
      Math.pow(left.x - right.x, 2) + Math.pow(left.y - right.y, 2)
    );
    
    // Eye Aspect Ratio
    return verticalDistance / horizontalDistance;
  }, []);

  // Initialize webcam
  const initializeWebcam = useCallback(async () => {
    try {
      setPermissionStatus('requesting');
      setErrorMessage('');
      
      // Request camera access with mobile-friendly constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera for mobile
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setPermissionStatus('granted');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setPermissionStatus('denied');
      setErrorMessage(
        error.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera access to use blink detection.'
          : 'Camera not available. Please check your device settings.'
      );
    }
  }, []);

  // Initialize MediaPipe FaceMesh
  const initializeFaceMesh = useCallback(async () => {
    try {
      // Load MediaPipe FaceMesh
      const faceMesh = new window.FaceMesh(FACE_MESH_CONFIG);
      
      faceMesh.setOptions({
        maxNumFaces: 1, // Process only one face for performance
        refineLandmarks: false, // Disable for better performance on mobile
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;
    } catch (error) {
      console.error('FaceMesh initialization error:', error);
      setErrorMessage('Failed to initialize face detection. Please refresh the page.');
    }
  }, []);

  // Handle FaceMesh results and blink detection
  const onFaceMeshResults = useCallback((results) => {
    if (!canvasRef.current || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }
    
    const landmarks = results.multiFaceLandmarks[0];
    const currentTime = Date.now();
    const blinkState = blinkStateRef.current;
    
    // Calculate eye aspect ratios for both eyes
    const leftEAR = calculateEyeAspectRatio(landmarks, LEFT_EYE_LANDMARKS);
    const rightEAR = calculateEyeAspectRatio(landmarks, RIGHT_EYE_LANDMARKS);
    
    // Average eye aspect ratio
    const averageEAR = (leftEAR + rightEAR) / 2;
    
    // Update blink state
    blinkState.leftEyeOpenness = leftEAR;
    blinkState.rightEyeOpenness = rightEAR;
    
    // Check if eyes are closed (blink detected)
    const eyesClosed = averageEAR < BLINK_THRESHOLDS.eyeAspectRatioThreshold;
    
    if (eyesClosed && !blinkState.isBlinking) {
      // Start of potential blink
      blinkState.isBlinking = true;
      blinkState.blinkStartTime = currentTime;
      blinkState.consecutiveBlinks = 1;
    } else if (eyesClosed && blinkState.isBlinking) {
      // Continuing blink
      blinkState.consecutiveBlinks++;
    } else if (!eyesClosed && blinkState.isBlinking) {
      // End of blink - check if it was a valid blink
      const blinkDuration = currentTime - blinkState.blinkStartTime;
      const timeSinceLastBlink = currentTime - blinkState.lastBlinkTime;
      
      const isValidBlink = 
        blinkDuration >= BLINK_THRESHOLDS.minBlinkDuration &&
        blinkState.consecutiveBlinks >= BLINK_THRESHOLDS.consecutiveFrames &&
        timeSinceLastBlink >= BLINK_THRESHOLDS.cooldownPeriod;
      
      if (isValidBlink) {
        // Trigger blink action
        setIsBlinkDetected(true);
        setCurrentContent(prev => prev === 'A' ? 'B' : 'A');
        
        // Change background color on blink
        const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        setBackgroundColor(randomColor);
        
        blinkState.lastBlinkTime = currentTime;
        
        // Reset blink indicator after short delay
        setTimeout(() => setIsBlinkDetected(false), 200);
      }
      
      // Reset blink state
      blinkState.isBlinking = false;
      blinkState.consecutiveBlinks = 0;
    }
    
    // Draw debug overlay if enabled
    if (showDebug) {
      drawDebugOverlay(results, landmarks);
    }
  }, [calculateEyeAspectRatio, showDebug]);

  // Draw debug overlay with eye landmarks
  const drawDebugOverlay = useCallback((results, landmarks) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw eye landmarks
    const drawEyeLandmarks = (eyeLandmarks, color) => {
      ctx.fillStyle = color;
      Object.values(eyeLandmarks).forEach(index => {
        const landmark = landmarks[index];
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvas.width,
          landmark.y * canvas.height,
          3, // Point size
          0,
          2 * Math.PI
        );
        ctx.fill();
      });
    };
    
    drawEyeLandmarks(LEFT_EYE_LANDMARKS, '#FF6B6B');
    drawEyeLandmarks(RIGHT_EYE_LANDMARKS, '#4ECDC4');
    
    // Draw eye openness values
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px monospace';
    ctx.fillText(`L: ${blinkStateRef.current.leftEyeOpenness.toFixed(3)}`, 10, 20);
    ctx.fillText(`R: ${blinkStateRef.current.rightEyeOpenness.toFixed(3)}`, 10, 40);
  }, []);

  // Main processing loop
  const processVideo = useCallback(() => {
    if (videoRef.current && faceMeshRef.current && isCameraActive) {
      faceMeshRef.current.send({ image: videoRef.current });
    }
    animationFrameRef.current = requestAnimationFrame(processVideo);
  }, [isCameraActive]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close FaceMesh
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
    
    setIsCameraActive(false);
  }, []);

  // Initialize on component mount
  useEffect(() => {
    const initialize = async () => {
      await initializeFaceMesh();
    };
    
    initialize();
    
    return cleanup;
  }, [initializeFaceMesh, cleanup]);

  // Start video processing when camera is active
  useEffect(() => {
    if (isCameraActive) {
      processVideo();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, processVideo]);

  // Handle video metadata loaded
  const handleVideoLoadedMetadata = () => {
    if (canvasRef.current && videoRef.current) {
      // Set canvas dimensions to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
    }
  };

  return (
    <div className="blink-detector">
      {/* Header with status */}
      <header className="header">
        <h1>Blink Detection Demo</h1>
        <div className="status-indicators">
          <div className={`status ${isCameraActive ? 'active' : 'inactive'}`}>
            📹 Camera {isCameraActive ? 'Active' : 'Inactive'}
          </div>
          {isBlinkDetected && (
            <div className="status blink-detected">
              👁️ Blink Detected!
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="main-content">
        {/* Permission prompt */}
        {permissionStatus === 'prompting' && (
          <div className="permission-prompt">
            <h2>Enable Camera for Blink Detection</h2>
            <p>
              This demo uses your webcam to detect eye blinks and change content.
              Your camera feed is processed locally and never leaves your device.
            </p>
            <button 
              onClick={initializeWebcam}
              className="primary-button"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
            <button onClick={initializeWebcam} className="secondary-button">
              Try Again
            </button>
          </div>
        )}

        {/* Camera and content display */}
        {isCameraActive && (
          <div className="camera-container">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoadedMetadata}
                className="video-feed"
              />
              <canvas
                ref={canvasRef}
                className={`debug-overlay ${showDebug ? 'visible' : 'hidden'}`}
              />
            </div>
            
            {/* Content that changes on blink */}
            <div className="content-display">
              {currentContent === 'A' ? (
                <div className="content-a">
                  <h2>Content A</h2>
                  <p>Blink to switch to Content B</p>
                </div>
              ) : (
                <div className="content-b">
                  <h2>Content B</h2>
                  <p>Blink to switch back to Content A</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="controls">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="control-button"
          disabled={!isCameraActive}
        >
          {showDebug ? 'Hide' : 'Show'} Debug
        </button>
        <button
          onClick={cleanup}
          className="control-button danger"
          disabled={!isCameraActive}
        >
          Stop Camera
        </button>
      </footer>

      <style jsx>{`
        .blink-detector {
          min-height: 100vh;
          background: linear-gradient(135deg, ${backgroundColor} 0%, #764ba2 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          transition: background 0.5s ease;
        }

        .header {
          padding: 1rem;
          text-align: center;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .header h1 {
          margin: 0 0 1rem 0;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
        }

        .status-indicators {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .status {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .status.active {
          background: #10b981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }

        .status.inactive {
          background: #6b7280;
        }

        .status.blink-detected {
          background: #f59e0b;
          animation: pulse 0.5s ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .main-content {
          flex: 1;
          padding: 2rem 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .permission-prompt {
          text-align: center;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .permission-prompt h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .permission-prompt p {
          margin: 0 0 2rem 0;
          line-height: 1.6;
          opacity: 0.9;
        }

        .error-message {
          text-align: center;
          max-width: 400px;
          background: rgba(239, 68, 68, 0.2);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(239, 68, 68, 0.5);
        }

        .camera-container {
          width: 100%;
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .video-wrapper {
          position: relative;
          background: #000;
          border-radius: 1rem;
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        .video-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror video for natural interaction */
        }

        .debug-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          transform: scaleX(-1);
        }

        .debug-overlay.visible {
          opacity: 1;
        }

        .debug-overlay.hidden {
          opacity: 0;
        }

        .content-display {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
          text-align: center;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .content-display h2 {
          margin: 0 0 1rem 0;
          font-size: 2rem;
        }

        .content-display p {
          margin: 0;
          opacity: 0.8;
        }

        .content-a {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
        }

        .content-b {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3));
        }

        .controls {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .primary-button,
        .secondary-button,
        .control-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 44px; /* Touch-friendly size */
        }

        .primary-button {
          background: #3b82f6;
          color: white;
        }

        .primary-button:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .secondary-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .control-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .control-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .control-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .control-button.danger {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .control-button.danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .camera-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .video-wrapper {
            max-width: 100%;
            aspect-ratio: 3/4; /* Portrait orientation for mobile */
          }

          .content-display {
            min-height: 200px;
            padding: 1.5rem;
          }

          .main-content {
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 0.75rem;
          }

          .status-indicators {
            gap: 0.5rem;
          }

          .status {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }

          .permission-prompt,
          .error-message {
            padding: 1.5rem;
            margin: 0 0.5rem;
          }

          .controls {
            padding: 0.75rem;
          }

          .primary-button,
          .secondary-button,
          .control-button {
            padding: 0.625rem 1.25rem;
            font-size: 0.875rem;
          }
        }

        @media (max-width: 360px) {
          .permission-prompt h2,
          .error-message h2 {
            font-size: 1.25rem;
          }

          .content-display h2 {
            font-size: 1.5rem;
          }

          .permission-prompt p,
          .error-message p {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BlinkDetector;
