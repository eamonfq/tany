const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/templates - all active templates
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const templates = db.prepare(
      'SELECT * FROM message_templates WHERE is_active = 1 ORDER BY type, name'
    ).all();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/templates - create template
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { name, type, template } = req.body;

    if (!name || !type || !template) {
      return res.status(400).json({ error: 'name, type y template son obligatorios' });
    }

    const result = db.prepare(
      'INSERT INTO message_templates (name, type, template) VALUES (?, ?, ?)'
    ).run([name, type, template]);

    const created = db.prepare('SELECT * FROM message_templates WHERE id = ?').get([result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id - update template
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const templateId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM message_templates WHERE id = ?').get([templateId]);
    if (!existing) return res.status(404).json({ error: 'Plantilla no encontrada' });

    const { name, type, template, is_active } = req.body;

    db.prepare(
      'UPDATE message_templates SET name = ?, type = ?, template = ?, is_active = ? WHERE id = ?'
    ).run([
      name || existing.name,
      type || existing.type,
      template || existing.template,
      is_active != null ? is_active : existing.is_active,
      templateId
    ]);

    const updated = db.prepare('SELECT * FROM message_templates WHERE id = ?').get([templateId]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
