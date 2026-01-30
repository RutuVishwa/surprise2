# 🚀 Vercel Deployment Guide

## 📋 Overview
This application has been optimized for Vercel deployment with serverless functions and static file serving.

## 🏗️ Architecture
- **Frontend**: React-based with Tailwind CSS
- **Backend**: Node.js Express serverless functions
- **Static Assets**: Photos and music served from `/public`
- **Deployment**: Vercel serverless platform

## 📁 Project Structure
```
├── api/
│   └── index.js          # Main serverless function
├── public/
│   ├── photos/           # Photo assets
│   └── music/            # Music assets
├── templates/
│   └── index.html        # Main HTML template
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── .env.example          # Environment variables template
```

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

### 4. Follow the prompts:
- Link to existing project or create new
- Confirm deployment settings
- Your app will be live at `https://your-app.vercel.app`

## ⚙️ Configuration

### Vercel.json
- Routes API calls to serverless functions
- Serves static assets efficiently
- Configures build settings
- Sets environment variables

### Environment Variables
Copy `.env.example` to `.env` for local development:
```bash
cp .env.example .env
```

## 🎯 Key Features for Production

### ✅ Serverless Functions
- `/api/get_status` - Get current memory state
- `/api/manual_blink` - Handle manual blink triggers
- `/health` - Health check endpoint

### ✅ Static Asset Optimization
- Photos served from CDN
- Music files optimized for streaming
- HTML templates cached efficiently

### ✅ Performance Optimizations
- No camera dependencies (serverless compatible)
- Efficient state management
- Fast API responses
- Optimized bundle sizes

### ✅ Security
- CORS enabled
- Input validation
- Rate limiting on blink endpoints
- Secure file serving

## 🔧 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

### 3. Access Application
Open `http://localhost:3000` in your browser

## 📱 Features

### 🎨 Frontend
- Beautiful love-themed design
- Flip card animations
- Memory gallery with photos and text
- Responsive layout
- Smooth transitions

### 🔙 Backend
- Memory state management
- Photo serving
- Music streaming
- Blink detection simulation
- RESTful API endpoints

## 🎵 Assets

### Photos
- 25 photos in `/public/photos/`
- Named `1.jpeg` to `25.jpeg`
- Automatically sorted and served

### Music
- Background music in `/public/music/`
- Streaming optimized
- Auto-play on gallery access

## 🐛 Troubleshooting

### Common Issues

1. **Photos not loading**
   - Ensure photos are in `/public/photos/`
   - Check file naming (1.jpeg, 2.jpeg, etc.)
   - Verify file permissions

2. **API not responding**
   - Check Vercel logs
   - Verify function deployment
   - Check environment variables

3. **Music not playing**
   - Check browser audio policies
   - Verify music file exists
   - Check file path in `/public/music/`

### Debug Mode
Add `?debug=true` to URL for additional logging.

## 🔄 Updates

### To update the application:
1. Make changes locally
2. Test with `npm run dev`
3. Deploy with `vercel --prod`

### To add new photos:
1. Add to `/public/photos/`
2. Follow naming convention (26.jpeg, 27.jpeg, etc.)
3. Update `TOTAL_PHOTOS` in environment if needed

## 📞 Support

For deployment issues:
- Check Vercel dashboard logs
- Verify configuration in `vercel.json`
- Ensure all dependencies are in `package.json`

## 🎉 Success!

Your Love Blink Detection app is now live on Vercel! 🎊

Share your deployment URL and spread the love! 💕
