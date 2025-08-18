import 'dotenv/config';
import path from 'path';
import { promises as fsPromises } from 'fs';
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { z } from 'zod';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'server', 'data', 'qube.sqlite');
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma3:latest';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Initialize DB
const dbDir = path.dirname(DB_PATH);
await (async () => {
  await fsPromises.mkdir(dbDir, { recursive: true }).catch(() => {});
})();
const db = new Database(DB_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  model TEXT DEFAULT 'gemma3:latest',
  temperature REAL DEFAULT 0.6,
  top_p REAL DEFAULT 0.9,
  max_tokens INTEGER DEFAULT 2048,
  theme TEXT DEFAULT 'dark'
);
INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

// Helpers
const SettingsSchema = z.object({
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  top_p: z.number().min(0).max(1),
  max_tokens: z.number().min(16).max(32768),
  theme: z.enum(['dark', 'light'])
});

function getSettings() {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  return row;
}

function updateSettings(input) {
  const data = SettingsSchema.parse(input);
  db.prepare(`UPDATE settings SET model=@model, temperature=@temperature, top_p=@top_p, max_tokens=@max_tokens, theme=@theme WHERE id=1`).run(data);
  return getSettings();
}

function listConversations() {
  return db.prepare('SELECT id, title, created_at FROM conversations ORDER BY created_at DESC').all();
}

function createConversation(title = 'Yeni Sohbet') {
  const info = db.prepare('INSERT INTO conversations (title) VALUES (?)').run(title);
  return { id: info.lastInsertRowid, title };
}

function getMessages(conversationId) {
  return db.prepare('SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY id ASC').all(conversationId);
}

function addMessage(conversationId, role, content) {
  const info = db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, role, content);
  return info.lastInsertRowid;
}

// Ollama/Gemma invocation
async function generateWithGemma(messages, settings) {
  const url = `${OLLAMA_HOST}/api/generate`;
  const prompt = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\nAssistant:';
  const body = {
    model: settings.model || GEMMA_MODEL,
    prompt,
    options: {
      temperature: settings.temperature,
      top_p: settings.top_p,
      num_predict: settings.max_tokens
    },
    stream: false
  };
  const res = await axios.post(url, body, { timeout: 120000 });
  return res.data.response?.trim() || '';
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/conversations', (req, res) => {
  res.json({ conversations: listConversations() });
});

app.post('/api/conversations', (req, res) => {
  const { title } = req.body || {};
  const conv = createConversation(title || 'Yeni Sohbet');
  res.json({ conversation: conv });
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  res.json({ messages: getMessages(Number(id)) });
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body || {};
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content gerekli' });
  }
  const conversationId = Number(id);
  addMessage(conversationId, 'user', content);
  const settings = getSettings();
  try {
    const messages = getMessages(conversationId);
    const reply = await generateWithGemma(messages, settings);
    addMessage(conversationId, 'assistant', reply);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Gemma yanıtı alınamadı', details: String(err) });
  }
});

app.get('/api/settings', (req, res) => {
  res.json({ settings: getSettings() });
});

app.put('/api/settings', (req, res) => {
  try {
    const updated = updateSettings(req.body || {});
    res.json({ settings: updated });
  } catch (e) {
    res.status(400).json({ error: 'Ayarlar geçersiz', details: String(e) });
  }
});

app.use('/api/privacy', (req, res) => {
  res.json({
    policy: 'Verileriniz yerel SQLite veritabanında saklanır. Üçüncü taraflara gönderilmez. Gemma modeli yerel çalışır.',
    data: {
      conversations: 'assistant yanıtı üretimi için kullanılır',
      settings: 'model ve UI tercihleriniz'
    }
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

