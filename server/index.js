const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const itemsRouter = require('./routes/items');
const clientsRouter = require('./routes/clients');
const quotesRouter = require('./routes/quotes');
const invoicesRouter = require('./routes/invoices');
const remindersRouter = require('./routes/reminders');
const templatesRouter = require('./routes/templates');
const dashboardRouter = require('./routes/dashboard');
const whatsappRouter = require('./routes/whatsapp');
const authRouter = require('./routes/auth');

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/whatsapp', whatsappRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    const db = await initDatabase();
    console.log('Database initialized successfully');

    // Migration: add discount_price column if not exists
    try {
      const cols = db.prepare("PRAGMA table_info(items)").all();
      if (!cols.find(c => c.name === 'discount_price')) {
        db.exec("ALTER TABLE items ADD COLUMN discount_price REAL");
        db.save();
        console.log('Migration: added discount_price column to items');
      }
    } catch (e) {
      console.log('Migration check skipped:', e.message);
    }

    app.listen(PORT, () => {
      console.log(`Eventos Tany API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
