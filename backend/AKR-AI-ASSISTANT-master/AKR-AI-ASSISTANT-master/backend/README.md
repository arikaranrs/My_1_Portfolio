# KIRA Voice Assistant - Backend

Backend server for KIRA AI Voice Assistant using LiveKit and Google Cloud APIs.

## 🏗️ Architecture

```
backend/
├── agent.py              # Main LiveKit agent (WebSocket-based)
├── flask_server.py       # Optional REST API server
├── prompt.py             # AI instructions and response logic
├── kira_memory.json      # Knowledge base (Q&A patterns)
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables template
└── README.md            # This file
```
mkdir kira-ai-assistant
cd kira-ai-assistant
mkdir backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

pip install flask flask_cors
pip install google-cloud-speech google-cloud-texttospeech
pip install textblob
pip install packaging
pip install openai
pip install requests
pip install TTS
npm install
npm install @vitejs/plugin-react-swc
npm install tailwindcss postcss autoprefixer
npm install tailwindcss-animate
npm install path
npm run dev



## 🚀 Quick Start

### 1. Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configuration

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
GOOGLE_API_KEY=your_google_api_key
```

### 3. Run the Server

**Option A: LiveKit Agent (Recommended for production)**
```bash
python agent.py
```

**Option B: Flask REST API (Simpler for development)**
```bash
python flask_server.py
```

## 📡 API Endpoints (Flask Server)

### Health Check
```bash
GET /health
```

### Ask KIRA
```bash
POST /api/ask
Content-Type: application/json

{
  "message": "What is your name?",
  "language": "en-US"
}
```

### View Memory
```bash
GET /api/memory
```

### Add Response Pattern
```bash
POST /api/memory/add
Content-Type: application/json

{
  "key": "new question",
  "value": "KIRA's answer"
}
```

## 🗂️ Knowledge Base (kira_memory.json)

Add new Q&A patterns to `kira_memory.json`:

```json
{
  "your question": "KIRA's response",
  "another question": "Another response"
}
```

**Key Features:**
- Pattern matching (exact + partial)
- Keyword detection
- Multi-language support
- Easy to update without code changes

## 🔧 Customization

### Adding New Languages

1. Update `kira_memory.json` with translations
2. Configure voice settings in `agent.py`
3. Test with language-specific queries

### Modifying AI Behavior

Edit `prompt.py`:
- `AGENT_INSTRUCTIONS` - System personality and rules
- `AGENT_RESPONSES` - Response generation guidelines
- `find_response()` - Pattern matching logic

## 🧪 Testing

```bash
# Test prompt system
python prompt.py

# Test Flask API
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

## 📦 Dependencies

- **livekit-agents** - Real-time voice communication
- **google-cloud-speech** - Speech-to-Text
- **google-cloud-texttospeech** - Text-to-Speech
- **flask** - REST API server
- **python-dotenv** - Environment management

## 🔒 Security Notes

- Never commit `.env` file to git
- Use environment variables for all secrets
- Enable CORS only for trusted origins
- Implement authentication for admin endpoints
- Rate limit API endpoints in production

## 🐛 Troubleshooting

**Import Errors:**
```bash
pip install --upgrade -r requirements.txt
```

**LiveKit Connection Failed:**
- Check `LIVEKIT_URL` is correct
- Verify API key and secret
- Ensure network allows WebSocket connections

**Google API Errors:**
- Verify `GOOGLE_API_KEY` is valid
- Check API quotas in Google Cloud Console
- Enable required APIs (Speech-to-Text, Text-to-Speech)

## 📚 Documentation

- [LiveKit Agents](https://docs.livekit.io/agents/)
- [Google Cloud Speech](https://cloud.google.com/speech-to-text/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 👨‍💻 Created By

**Arikaran R**  
AI & Data Science Engineer

---

For issues or questions, please refer to the main project README.
