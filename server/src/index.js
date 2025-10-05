import express from 'express';
import cors from 'cors';
import multer from 'multer';
import db from './db.js';
import { login, logout, authenticate, getCurrentUser } from './middleware/auth.js';
import issuesRouter from './routes/issues.js';
import { importCSV } from './controllers/importController.js';

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Bad Request', message: 'Username and password required' });
  }
  const result = login(username, password);
  if (result.success) {
    res.json({ message: 'Login successful', token: result.token, username: result.username });
  } else {
    res.status(401).json({ error: 'Unauthorized', message: result.message });
  }
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.substring(7);
  logout(token);
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = getCurrentUser(req);
  res.json({ user });
});

app.use('/api', issuesRouter);

app.post('/api/issues/import', authenticate, upload.single('file'), importCSV);

app.get('/api/test', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM issues LIMIT 1');
    res.json({ success: true, count: rows.length, sampleIssue: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('✓ Trial Issues API Server Started');
  console.log('='.repeat(60));
  console.log(`✓ Port: ${PORT}`);
  console.log(`✓ Health: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('AUTH ENDPOINTS (PUBLIC):');
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/logout (protected)`);
  console.log(`  GET    /api/auth/me (protected)`);
  console.log('='.repeat(60));
  console.log('ISSUES ENDPOINTS (PROTECTED):');
  console.log(`  GET    /api/issues              - List all (with filters)`);
  console.log(`  GET    /api/issues/:id          - Get single issue`);
  console.log(`  POST   /api/issues              - Create issue`);
  console.log(`  PUT    /api/issues/:id          - Update issue`);
  console.log(`  DELETE /api/issues/:id          - Delete issue`);
  console.log(`  PATCH  /api/issues/:id/resolve  - Quick resolve`);
  console.log('='.repeat(60));
  console.log('OTHER ENDPOINTS (PROTECTED):');
  console.log(`  GET    /api/dashboard           - Get statistics`);
  console.log(`  POST   /api/issues/import       - Import CSV`);
  console.log('='.repeat(60));
  console.log('Default credentials:');
  console.log('  username: admin');
  console.log('  password: admin123');
  console.log('='.repeat(60));
});