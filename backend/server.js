const http = require('http');
const fs = require('fs');
const path = require('path');

// Path to AKR-AI-ASSISTANT knowledge base memory
const memoryPath = path.join(__dirname, 'AKR-AI-ASSISTANT-master/AKR-AI-ASSISTANT-master/backend/kira_memory.json');

let kiraMemory = {};

function loadMemory() {
  try {
    const rawData = fs.readFileSync(memoryPath, 'utf8');
    kiraMemory = JSON.parse(rawData);
    console.log(`[KIRA Backend Engine] Loaded ${Object.keys(kiraMemory).length} knowledge entries from kira_memory.json`);
  } catch (err) {
    console.error('[KIRA Backend Engine] Failed to load kira_memory.json:', err.message);
  }
}

// Replicate exact find_response logic from AKR-AI-ASSISTANT prompt.py
function findResponse(userInput) {
  if (!userInput) return "Hello! I'm KIRA. How can I help you today?";
  const input = userInput.toLowerCase().trim();

  // 1. Direct match
  if (kiraMemory[input]) {
    return kiraMemory[input];
  }

  // 2. Partial match
  for (const [key, value] of Object.entries(kiraMemory)) {
    if (input.includes(key) || key.includes(input)) {
      return value;
    }
  }

  // 3. Keyword matching
  const inputWords = input.split(/\s+/);
  for (const [key, value] of Object.entries(kiraMemory)) {
    const keywords = key.split(/\s+/);
    if (keywords.some(word => word.length > 3 && inputWords.includes(word))) {
      return value;
    }
  }

  // Default response
  return kiraMemory['default'] || "I'm still learning about that. Could you ask me something else?";
}

loadMemory();

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /health
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      service: 'KIRA Voice Assistant API',
      version: '1.0.0'
    }));
    return;
  }

  // POST /api/kira/chat or POST /api/ask
  if (req.method === 'POST' && (req.url === '/api/kira/chat' || req.url === '/api/ask')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const userMsg = (data.message || '').trim();
        const userLang = data.language || 'English';

        if (!userMsg) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Missing message field',
            response: 'Please enter a message.'
          }));
          return;
        }

        const reply = findResponse(userMsg);
        console.log(`[KIRA API] Request: "${userMsg}" (${userLang}) -> Response: "${reply}"`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          response: reply,
          language: userLang,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error('[KIRA API Error]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          response: "Sorry, I'm temporarily unavailable. Please try again."
        }));
      }
    });
    return;
  }

  // 404 Endpoint
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`
  ===========================================
  🤖 KIRA AI ASSISTANT BACKEND SERVER RUNNING
  📡 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  Endpoints:
    - GET  /health
    - POST /api/kira/chat
    - POST /api/ask
  ===========================================
  `);
});
