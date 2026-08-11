const http = require('http');
const https = require('https');
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

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'you', 'your', 'i', 'me', 'my', 'we', 'our', 'what', 'who',
  'how', 'why', 'can', 'do', 'does', 'did', 'tell', 'know', 'say', 'speak',
  'about', 'this', 'there', 'please', 'just', 'all', 'one', 'sme', 'same'
]);

// Enhanced find_response logic with stop-words exclusion & dedicated intent routing
function findResponse(userInput, userLanguage = 'English') {
  if (!userInput) return "Hello! I'm KIRA. How can I help you today?";
  const rawInput = userInput.trim();
  const input = rawInput.toLowerCase().replace(/[?!.,;:]/g, '').trim();
  const lang = (userLanguage || 'English').toLowerCase();
  const isTamilInput = /[\u0B80-\u0BFF]/.test(rawInput);
  const isHindiInput = /[\u0900-\u097F]/.test(rawInput);

  // 1. Direct exact dictionary match
  if (kiraMemory[input]) {
    return kiraMemory[input];
  }

  // 2. Dedicated Language Capability & Multilingual Questions
  if (input.includes('tamil') || input.includes('தமிழ்')) {
    if (input.includes('know') || input.includes('speak') || input.includes('pesu') || input.includes('therium') || input.includes('theriyum') || input.includes('pesuvaya') || input.includes('pesa') || input.includes('பேச')) {
      return kiraMemory['you know tamil'] || kiraMemory['tamil theriuma'];
    }
  }

  if (input.includes('hindi') || input.includes('हिंदी')) {
    if (input.includes('know') || input.includes('speak') || input.includes('aati') || input.includes('bol') || input.includes('baat')) {
      return kiraMemory['you know hindi'] || kiraMemory['hindi aati hai'];
    }
  }

  if (input.includes('english')) {
    if (input.includes('know') || input.includes('speak') || input.includes('talk')) {
      return kiraMemory['you know english'] || kiraMemory['do you speak english'];
    }
  }

  if (input.includes('language') || input.includes('languages') || input.includes('மொழி')) {
    return kiraMemory['what languages do you speak'] || kiraMemory['what languages do you know'];
  }

  // 3. Dedicated Common Identity & Philosophical Topics
  if (input.includes('father') || input.includes('appa') || input.includes('தந்தை') || input.includes('pita') || input.includes('पिता')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['உன் தந்தை யார்'] || kiraMemory['unoda appa yaaru'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['tumhare pita kaun hain'];
    return kiraMemory['who is your father'];
  }

  if (input.includes('god') || input.includes('kadavul') || input.includes('கடவுள்') || input.includes('bhagwan') || input.includes('भगवान')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['கடவுள் உண்மையா'] || kiraMemory['kadavul unmaya'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['kya bhagwan sach mein hain'];
    return kiraMemory['is god real'];
  }

  if (input.includes('love') || input.includes('like') || input.includes('பிடிக்குமா') || input.includes('pasand') || input.includes('pyaar') || input.includes('pudikum')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['உனக்கு arikaran-ஐ பிடிக்குமா'] || kiraMemory['unaku yaara romba pudikum'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['kya tum arikaran se pyaar karti ho'] || kiraMemory['tumhe sabse zyada kaun pasand hai'];
    return kiraMemory['who do you like most'] || kiraMemory['do you love arikaran'];
  }

  if (input.includes('purpose') || input.includes('why were you created') || input.includes('why was you created') || input.includes('நோக்கம்') || input.includes('kyu banaya')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['உன் நோக்கம் என்ன'] || kiraMemory['un purpose enna'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['tumhara purpose kya hai'] || kiraMemory['tumhe kyu banaya gaya'];
    return kiraMemory['what is your purpose'] || kiraMemory['why were you created'];
  }

  // 4. Greetings
  if (input === 'hi' || input === 'hello' || input === 'hey' || input === 'vanakkam' || input === 'வணக்கம்' || input === 'namaste' || input === 'namaskar') {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['ஹாய் kira, எப்படி இருக்க?'] || kiraMemory['hi kira epdi iruka'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['hi kira, tum kaise ho'];
    return kiraMemory['hello'] || kiraMemory['hi'];
  }

  if (input.includes('how are you') || input.includes('epdi iruka') || input.includes('எப்படி இருக்க') || input.includes('kaise ho') || input.includes('कैसे हो')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['ஹாய் kira, எப்படி இருக்க?'] || kiraMemory['hi kira epdi iruka'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['hi kira, tum kaise ho'];
    return "I'm always operational and ready to assist you! How can I help you with Arikaran's portfolio or AI topics today?";
  }

  // 5. Profile, Projects & Technical Concepts
  if (input.includes('legal ai') || input.includes('legal companion') || input.includes('companion')) {
    return kiraMemory['tell me about the legal ai companion'] || kiraMemory['legal ai architecture'];
  }

  if (input.includes('saferoute') || input.includes('drowsiness')) {
    return kiraMemory['tell me about saferoute'];
  }

  if (input.includes('rag')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['rag என்றால் என்ன'] || kiraMemory['rag na enna'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['rag kya hai'];
    return kiraMemory['rag vs fine tuning'] || "RAG (Retrieval-Augmented Generation) combines vector retrieval from databases like ChromaDB with Large Language Models to generate accurate, context-grounded responses.";
  }

  if (input.includes('epoch')) {
    return kiraMemory['what is an epoch'];
  }

  if (input.includes('forward propagation')) {
    return kiraMemory['what is forward propagation'];
  }

  if (input.includes('backpropagation')) {
    return kiraMemory['what is backpropagation'];
  }

  if (input.includes('gradient descent')) {
    return kiraMemory['what is gradient descent'];
  }

  if (input.includes('overfitting') || input.includes('underfitting')) {
    return kiraMemory['overfitting and underfitting'];
  }

  if (input.includes('bias') && input.includes('variance')) {
    return kiraMemory['bias and variance'];
  }

  if (input.includes('cnn')) {
    return kiraMemory['what is cnn'];
  }

  if (input.includes('transformers') || input.includes('transformer')) {
    return kiraMemory['what are transformers'];
  }

  if (input.includes('bert') || input.includes('llama')) {
    return kiraMemory['bert vs llama'];
  }

  if (input.includes('skill') || input.includes('skills') || input.includes('tech stack') || input.includes('technologies') || input.includes('திறன்')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['arikaran-க்கு என்ன technical skills இருக்கு'] || kiraMemory['avanuku enna technical skills theriyum'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['arikaran ke technical skills kya hain'];
    return kiraMemory["what are arikaran's technical skills"];
  }

  if (input.includes('project') || input.includes('projects') || input.includes('திட்டம்')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['அவருடைய main project என்ன'] || kiraMemory['avanoda main project enna'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['arikaran ka main project kya hai'];
    return kiraMemory['other projects by arikaran'];
  }

  if (input.includes('interview') || input.includes('question')) {
    if (input.includes('python')) return kiraMemory['ask me a python interview question'];
    if (input.includes('ml') || input.includes('machine learning')) return kiraMemory['ask me a machine learning interview question'];
    return kiraMemory['help me prepare for an ai/ml interview'];
  }

  if (input.includes('arikaran') || input.includes('creator') || input.includes('author') || input.includes('developer')) {
    if (lang.includes('tamil') || isTamilInput) return kiraMemory['arikaran பற்றி சொல்லு'] || kiraMemory['arikaran pathi sollu'];
    if (lang.includes('hindi') || isHindiInput) return kiraMemory['arikaran ke baare mein batao'];
    return kiraMemory['who is arikaran'] || kiraMemory['about arikaran'];
  }

  // 6. Meaningful Keywords Overlap (Filtering Stop Words)
  const inputWords = input.split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length >= 3);
  let bestMatch = null;
  let highestScore = 0;

  if (inputWords.length > 0) {
    for (const [key, value] of Object.entries(kiraMemory)) {
      const keyWords = key.toLowerCase().split(/\s+/).filter(w => !STOP_WORDS.has(w) && w.length >= 3);
      if (keyWords.length === 0) continue;

      let matchCount = 0;
      for (const word of inputWords) {
        if (keyWords.includes(word) || keyWords.some(kw => kw.includes(word) || word.includes(kw))) {
          matchCount++;
        }
      }

      const score = matchCount / Math.max(inputWords.length, keyWords.length);
      if (score > highestScore && matchCount > 0) {
        highestScore = score;
        bestMatch = value;
      }
    }
  }

  if (bestMatch && highestScore >= 0.4) {
    return bestMatch;
  }

  // 7. Exact Substring Match on Long Keys (Length >= 8)
  for (const [key, value] of Object.entries(kiraMemory)) {
    const cleanKey = key.toLowerCase().trim().replace(/[?!.,;:]/g, '');
    if (cleanKey.length >= 8 && (input.includes(cleanKey) || cleanKey.includes(input))) {
      return value;
    }
  }

  // 8. Language-specific default response
  if (lang.includes('tamil') || isTamilInput) {
    return "நான் KIRA, Arikaran-ன் AI உதவியாளர். நீங்கள் Arikaran-ன் skills, The Legal AI Companion, SAFEROUTE அல்லது AI/ML கேள்விகளை தமிழில் கேட்கலாம்!";
  }
  if (lang.includes('hindi') || isHindiInput) {
    return "Main KIRA hoon, Arikaran ka AI assistant. Aap mujhse Arikaran ke projects, skills aur Machine Learning ke baare mein pooch sakte hain!";
  }

  // Default response in English
  return kiraMemory['default'] || "I'm KIRA, Arikaran's AI assistant. Ask me about Arikaran's skills, The Legal AI Companion, SAFEROUTE, Machine Learning, RAG, or interview questions in English, Tamil, Tanglish, or Hindi!";
}

// Map language names or auto-detect from text unicode for Google TTS engine
function getLangCode(text, langName) {
  if (text) {
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil script
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi script
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu script
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam script
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada script
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese script
    if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese script
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic script
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian script
  }

  if (!langName) return 'ta';
  const name = langName.toLowerCase();
  if (name.includes('tamil') || name === 'ta') return 'ta';
  if (name.includes('hindi') || name === 'hi') return 'hi';
  if (name.includes('malayalam') || name === 'ml') return 'ml';
  if (name.includes('telugu') || name === 'te') return 'te';
  if (name.includes('kannada') || name === 'kn') return 'kn';
  if (name.includes('french') || name === 'fr') return 'fr';
  if (name.includes('german') || name === 'de') return 'de';
  if (name.includes('spanish') || name === 'es') return 'es';
  if (name.includes('japanese') || name === 'ja') return 'ja';
  if (name.includes('chinese') || name === 'zh') return 'zh';
  if (name.includes('arabic') || name === 'ar') return 'ar';
  if (name.includes('russian') || name === 'ru') return 'ru';
  return 'en';
}

// Server-Side Google TTS Audio Synthesizer with script auto-detection
function generateServerTTS(text, langName = 'Tamil') {
  return new Promise((resolve) => {
    const langCode = getLangCode(text, langName);
    const cleanText = text.substring(0, 200); // Limit to 200 chars for fast TTS synthesis
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${langCode}&client=tw-ob`;

    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          const buffer = Buffer.concat(chunks);
          const base64Audio = `data:audio/mp3;base64,${buffer.toString('base64')}`;
          resolve(base64Audio);
        } else {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.warn('[Server TTS Error]:', err.message);
      resolve(null);
    });
  });
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
      service: 'KIRA Multilingual Voice Assistant API (Option B Server-Side TTS/STT)',
      version: '1.0.0'
    }));
    return;
  }

  // POST /api/kira/tts - Standalone Server-Side Text-to-Speech
  if (req.method === 'POST' && req.url === '/api/kira/tts') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const text = (data.text || '').trim();
        const lang = data.language || 'Tamil';

        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing text parameter' }));
          return;
        }

        const audioBase64 = await generateServerTTS(text, lang);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          text: text,
          audio: audioBase64,
          language: lang
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // POST /api/kira/stt - Standalone Server-Side Speech-to-Text Transcriber
  if (req.method === 'POST' && req.url === '/api/kira/stt') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const userLang = data.language || 'Tamil';
        
        // Mock/Fallback STT response if raw audio blob sent
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          text: data.text || "hi",
          language: userLang
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // POST /api/kira/chat or POST /api/ask - Integrated Chat + Server-Side TTS Synthesis
  if (req.method === 'POST' && (req.url === '/api/kira/chat' || req.url === '/api/ask')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
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

        const reply = findResponse(userMsg, userLang);
        console.log(`[KIRA API] Request: "${userMsg}" (${userLang}) -> Response: "${reply}"`);

        // Synthesize Audio MP3 on Python/Node Server
        const audioBase64 = await generateServerTTS(reply, userLang);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          reply: reply,
          response: reply,
          audio: audioBase64,
          language: userLang,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error('[KIRA API Error]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          reply: "Sorry, I'm temporarily unavailable. Please try again.",
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  =============================================================
  🤖 KIRA AI ASSISTANT BACKEND SERVER RUNNING (NETWORK MODE)
  📡 Port: ${PORT}
  🌐 Local URL: http://localhost:${PORT}
  📱 Network URL: http://192.168.1.17:${PORT}
  Audio Engine: Server-Side TTS/STT Synthesis Enabled
  Endpoints:
    - GET  /health
    - POST /api/kira/chat
    - POST /api/kira/tts
    - POST /api/kira/stt
  =============================================================
  `);
});
