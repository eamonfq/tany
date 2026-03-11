const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const requireAdmin = require('../middleware/requireAdmin');

// GET /api/clients - List all active clients, optional ?status= and ?search=
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status, search } = req.query;
    let clients;

    if (status && search) {
      const searchPattern = `%${search}%`;
      clients = db.prepare(
        'SELECT * FROM clients WHERE is_active = 1 AND status = ? AND (name LIKE ? OR phone LIKE ?) ORDER BY updated_at DESC'
      ).all([status, searchPattern, searchPattern]);
    } else if (status) {
      clients = db.prepare(
        'SELECT * FROM clients WHERE is_active = 1 AND status = ? ORDER BY updated_at DESC'
      ).all([status]);
    } else if (search) {
      const searchPattern = `%${search}%`;
      clients = db.prepare(
        'SELECT * FROM clients WHERE is_active = 1 AND (name LIKE ? OR phone LIKE ?) ORDER BY updated_at DESC'
      ).all([searchPattern, searchPattern]);
    } else {
      clients = db.prepare(
        'SELECT * FROM clients WHERE is_active = 1 ORDER BY updated_at DESC'
      ).all();
    }
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get([Number(req.params.id)]);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clients/:id/history
router.get('/:id/history', (req, res) => {
  try {
    const db = getDb();
    const clientId = Number(req.params.id);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get([clientId]);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    const quotes = db.prepare(
      'SELECT * FROM quotes WHERE client_id = ? ORDER BY created_at DESC'
    ).all([clientId]);

    const invoices = db.prepare(
      'SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC'
    ).all([clientId]);

    const reminders = db.prepare(
      'SELECT * FROM reminders WHERE client_id = ? ORDER BY reminder_date DESC'
    ).all([clientId]);

    res.json({ quotes, invoices, reminders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/clients
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name, phone, email, address, status, source, notes, last_contact_date, next_follow_up, special_date, special_date_label } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'name y phone son obligatorios' });
    }

    const result = db.prepare(
      `INSERT INTO clients (name, phone, email, address, status, source, notes, last_contact_date, next_follow_up, special_date, special_date_label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run([
      name, phone, email || null, address || null,
      status || 'Prospecto', source || null, notes || null,
      last_contact_date || null, next_follow_up || null,
      special_date || null, special_date_label || null
    ]);

    let client = null;
    if (result.lastInsertRowid) {
      client = db.prepare('SELECT * FROM clients WHERE id = ?').get([result.lastInsertRowid]);
    }
    if (!client) {
      // Fallback: buscar por nombre y telefono
      client = db.prepare(
        'SELECT * FROM clients WHERE name = ? AND phone = ? ORDER BY id DESC LIMIT 1'
      ).get([name, phone]);
    }
    res.status(201).json(client || { id: result.lastInsertRowid, name, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const clientId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get([clientId]);
    if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });

    const { name, phone, email, address, status, source, notes, last_contact_date, next_follow_up, special_date, special_date_label } = req.body;
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE clients SET name = ?, phone = ?, email = ?, address = ?, status = ?, source = ?, notes = ?,
       last_contact_date = ?, next_follow_up = ?, special_date = ?, special_date_label = ?, updated_at = ?
       WHERE id = ?`
    ).run([
      name || existing.name,
      phone || existing.phone,
      email !== undefined ? email : existing.email,
      address !== undefined ? address : existing.address,
      status || existing.status,
      source !== undefined ? source : existing.source,
      notes !== undefined ? notes : existing.notes,
      last_contact_date !== undefined ? last_contact_date : existing.last_contact_date,
      next_follow_up !== undefined ? next_follow_up : existing.next_follow_up,
      special_date !== undefined ? special_date : existing.special_date,
      special_date_label !== undefined ? special_date_label : existing.special_date_label,
      now,
      clientId
    ]);

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get([clientId]);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/clients/:id (soft delete)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const clientId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get([clientId]);
    if (!existing) return res.status(404).json({ error: 'Cliente no encontrado' });

    db.prepare('UPDATE clients SET is_active = 0, updated_at = ? WHERE id = ?').run([
      new Date().toISOString(), clientId
    ]);
    res.json({ message: 'Cliente desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
