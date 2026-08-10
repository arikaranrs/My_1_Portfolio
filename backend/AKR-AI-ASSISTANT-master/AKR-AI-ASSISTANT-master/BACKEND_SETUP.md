# KIRA Backend Setup Guide

## 📋 Overview

KIRA has **two components**:

1. **Frontend (React)** - Already deployed in Lovable ✅
2. **Backend (Python)** - Needs to be run separately 🔧

The frontend works standalone using Web Speech API. The backend provides advanced features with LiveKit and Google Cloud.

## 🎯 Two Deployment Options

### Option 1: Frontend Only (Current - Working Now!)

**What you have:**
- ✅ React frontend with Web Speech API
- ✅ Voice recognition in 6+ languages
- ✅ Pattern matching from JSON memory
- ✅ Text-to-Speech responses
- ✅ Works on any device with Chrome/Safari/Edge

**Perfect for:** Testing, demos, personal use

### Option 2: Frontend + Backend (Advanced)

**What you need to set up:**
- 🔧 Python backend server
- 🔧 LiveKit account (for better voice quality)
- 🔧 Google Cloud API keys

**Perfect for:** Production apps, real-time collaboration, advanced features

---

## 🚀 Setting Up the Backend

### Step 1: Download Backend Files

The backend code is in the `backend/` folder:

```
KIRA_PROJECT/
├── backend/
│   ├── agent.py              # LiveKit voice agent
│   ├── flask_server.py       # REST API server
│   ├── prompt.py             # AI logic & patterns
│   ├── kira_memory.json      # Knowledge base
│   ├── requirements.txt      # Python packages
│   └── .env.example          # Config template
└── (your React frontend files)
```

### Step 2: Install Python Dependencies

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### Step 3: Configure API Keys

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```env
# LiveKit (get from https://livekit.io)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_secret_here

# Google Cloud (get from https://console.cloud.google.com)
GOOGLE_API_KEY=your_google_key_here
```

### Step 4: Run the Backend

**Option A: LiveKit Agent (Real-time voice)**
```bash
python agent.py
```

**Option B: Flask API (HTTP endpoints)**
```bash
python flask_server.py
```

---

## 🔑 Getting API Keys

### LiveKit Setup

1. Go to [https://livekit.io](https://livekit.io)
2. Create a free account
3. Create a new project
4. Copy:
   - WebSocket URL
   - API Key
   - API Secret

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable these APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
4. Create credentials → API Key
5. Copy the API key

---

## 🔗 Connecting Frontend to Backend

### If using Flask server:

Update the frontend to call your backend:

```typescript
// In src/lib/voiceRecognition.ts or a new API client

const BACKEND_URL = 'http://localhost:5000'; // Change to your server

async function askKira(message: string) {
  const response = await fetch(`${BACKEND_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
}
```

### If using LiveKit:

You'll need to integrate LiveKit's React SDK:

```bash
npm install @livekit/components-react livekit-client
```

---

## 📱 Current Status

**Your React app is already working!** 🎉

- The frontend uses browser-native Web Speech API
- No backend required for basic functionality
- Works on desktop and mobile
- Supports 6+ languages out of the box

**When to add the backend:**

- You need better voice quality (LiveKit has lower latency)
- You want server-side processing
- You need to store conversation history
- You want to integrate with external APIs

---

## 🧪 Testing

**Test Frontend (no backend needed):**
1. Open your Lovable app
2. Click the microphone
3. Say "Hello KIRA"
4. Should work immediately!

**Test Backend:**
```bash
# Health check
curl http://localhost:5000/health

# Ask KIRA
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "what is your name"}'
```

---

## 🎓 File Structure Explained

### Backend Files:

| File | Purpose |
|------|---------|
| `agent.py` | Main LiveKit agent for real-time voice |
| `flask_server.py` | HTTP API server (simpler alternative) |
| `prompt.py` | AI personality & response logic |
| `kira_memory.json` | Q&A knowledge base (easy to edit!) |
| `requirements.txt` | Python packages to install |
| `.env` | Your API keys (keep secret!) |

### Frontend Files:

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Main app UI |
| `src/components/KiraOrb.tsx` | Animated 3D orb |
| `src/lib/voiceRecognition.ts` | Voice input/output |
| `src/lib/kiraMemory.ts` | Pattern matching |
| `src/data/kiraMemory.json` | Knowledge base (frontend copy) |

---

## ❓ FAQ

**Q: Do I need the backend to use KIRA?**  
A: No! The frontend works standalone. Backend adds advanced features.

**Q: Can I use KIRA without LiveKit?**  
A: Yes! The current version uses Web Speech API (built into browsers).

**Q: How do I add more responses?**  
A: Edit `kira_memory.json` (both frontend and backend versions).

**Q: Is it free?**  
A: Frontend is 100% free. LiveKit and Google Cloud have free tiers.

**Q: Can I deploy the backend?**  
A: Yes! Deploy to Heroku, Railway, DigitalOcean, or any Python host.

---

## 🆘 Need Help?

Check the troubleshooting section in `backend/README.md` or ask in the chat!

**Created by Arikaran R** | AI & Data Science Engineer
