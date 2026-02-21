const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/reminders - All reminders with client info, optional ?status=, ?type=, ?client_id=
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status, type, client_id } = req.query;
    let sql = `SELECT r.*, c.name as client_name, c.phone as client_phone
               FROM reminders r LEFT JOIN clients c ON r.client_id = c.id WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND r.type = ?';
      params.push(type);
    }
    if (client_id) {
      sql += ' AND r.client_id = ?';
      params.push(Number(client_id));
    }
    sql += ' ORDER BY r.reminder_date ASC';

    const reminders = db.prepare(sql).all(params);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reminders/today - reminders due today or overdue, status='Pendiente'
router.get('/today', (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const reminders = db.prepare(
      `SELECT r.*, c.name as client_name, c.phone as client_phone
       FROM reminders r LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.reminder_date <= ? AND r.status = 'Pendiente'
       ORDER BY r.priority DESC, r.reminder_date ASC`
    ).all([today]);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reminders/upcoming - reminders for next 7 days, status='Pendiente'
router.get('/upcoming', (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const reminders = db.prepare(
      `SELECT r.*, c.name as client_name, c.phone as client_phone
       FROM reminders r LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.reminder_date >= ? AND r.reminder_date <= ? AND r.status = 'Pendiente'
       ORDER BY r.reminder_date ASC`
    ).all([today, nextWeekStr]);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reminders - create reminder
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { client_id, invoice_id, quote_id, type, reminder_date, message_template, notes, priority } = req.body;

    if (!client_id || !type || !reminder_date) {
      return res.status(400).json({ error: 'client_id, type y reminder_date son obligatorios' });
    }

    const result = db.prepare(
      `INSERT INTO reminders (client_id, invoice_id, quote_id, type, reminder_date, message_template, status, notes, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?)`
    ).run([
      client_id, invoice_id || null, quote_id || null,
      type, reminder_date, message_template || null,
      notes || null, priority || 'Normal'
    ]);

    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get([result.lastInsertRowid]);
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reminders/:id/status - update status to 'Enviado' or 'Descartado'
router.put('/:id/status', (req, res) => {
  try {
    const db = getDb();
    const reminderId = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'status es obligatorio' });
    if (status !== 'Enviado' && status !== 'Descartado') {
      return res.status(400).json({ error: 'status debe ser "Enviado" o "Descartado"' });
    }

    const existing = db.prepare('SELECT * FROM reminders WHERE id = ?').get([reminderId]);
    if (!existing) return res.status(404).json({ error: 'Recordatorio no encontrado' });

    if (status === 'Enviado') {
      const now = new Date().toISOString();
      db.prepare('UPDATE reminders SET status = ?, sent_at = ? WHERE id = ?').run([status, now, reminderId]);
    } else {
      db.prepare('UPDATE reminders SET status = ? WHERE id = ?').run([status, reminderId]);
    }

    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get([reminderId]);
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
