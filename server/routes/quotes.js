const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const requireAdmin = require('../middleware/requireAdmin');

// Helper: generate next quote number COT-YYYY-NNNN
function generateQuoteNumber(db) {
  const year = new Date().getFullYear();
  const prefix = `COT-${year}-`;
  const last = db.prepare(
    "SELECT quote_number FROM quotes WHERE quote_number LIKE ? ORDER BY quote_number DESC LIMIT 1"
  ).get([`${prefix}%`]);

  let nextNum = 1;
  if (last && last.quote_number) {
    const parts = last.quote_number.split('-');
    nextNum = parseInt(parts[2], 10) + 1;
  }
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// Helper: calculate totals from items array
function calculateTotals(items, discountPercent) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountAmount = subtotal * (discountPercent || 0) / 100;
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}

// Helper: add days to a date string
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// GET /api/quotes - List all quotes, optional ?status=
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;
    let quotes;
    if (status) {
      quotes = db.prepare(
        `SELECT q.*, c.name as client_name, c.phone as client_phone
         FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
         WHERE q.status = ? ORDER BY q.created_at DESC`
      ).all([status]);
    } else {
      quotes = db.prepare(
        `SELECT q.*, c.name as client_name, c.phone as client_phone
         FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
         ORDER BY q.created_at DESC`
      ).all();
    }
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quotes/:id - includes quote_items with item info
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const quoteId = Number(req.params.id);
    const quote = db.prepare(
      `SELECT q.*, c.name as client_name, c.phone as client_phone, c.email as client_email, c.address as client_address
       FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
       WHERE q.id = ?`
    ).get([quoteId]);

    if (!quote) return res.status(404).json({ error: 'Cotizacion no encontrada' });

    const items = db.prepare(
      `SELECT qi.*, i.name as item_name, i.category as item_category, i.image_url as item_image_url
       FROM quote_items qi LEFT JOIN items i ON qi.item_id = i.id
       WHERE qi.quote_id = ? ORDER BY qi.id`
    ).all([quoteId]);

    res.json({ ...quote, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quotes - create quote with items
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { client_id, event_date, event_time, event_address, event_type, discount_percent, notes, items } = req.body;

    if (!client_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'client_id e items son obligatorios' });
    }

    const quoteNumber = generateQuoteNumber(db);
    const { subtotal, discountAmount, total } = calculateTotals(items, discount_percent);
    const validUntil = addDays(new Date().toISOString().split('T')[0], 15);

    const result = db.prepare(
      `INSERT INTO quotes (quote_number, client_id, event_date, event_time, event_address, event_type, subtotal, discount_percent, discount_amount, total, status, valid_until, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Borrador', ?, ?)`
    ).run([
      quoteNumber, client_id, event_date || null, event_time || null,
      event_address || null, event_type || null,
      subtotal, discount_percent || 0, discountAmount, total,
      validUntil, notes || null
    ]);

    let quoteId = result.lastInsertRowid;

    // Fallback: si lastInsertRowid es null, buscar por quote_number
    if (!quoteId) {
      const found = db.prepare('SELECT id FROM quotes WHERE quote_number = ?').get([quoteNumber]);
      quoteId = found ? found.id : null;
    }

    // Insert quote items
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_price;
      db.prepare(
        'INSERT INTO quote_items (quote_id, item_id, description, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run([
        quoteId, item.item_id || null, item.description,
        item.quantity, item.unit_price, lineTotal, item.notes || null
      ]);
    }

    // Return the created quote with items
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all([quoteId]);
    res.status(201).json({ ...(quote || { id: quoteId }), items: quoteItems || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/quotes/:id - update quote and replace items
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const quoteId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    if (!existing) return res.status(404).json({ error: 'Cotizacion no encontrada' });

    const { client_id, event_date, event_time, event_address, event_type, discount_percent, notes, items } = req.body;

    if (items && items.length > 0) {
      const { subtotal, discountAmount, total } = calculateTotals(items, discount_percent != null ? discount_percent : existing.discount_percent);
      const now = new Date().toISOString();

      db.prepare(
        `UPDATE quotes SET client_id = ?, event_date = ?, event_time = ?, event_address = ?, event_type = ?,
         subtotal = ?, discount_percent = ?, discount_amount = ?, total = ?, notes = ?, updated_at = ?
         WHERE id = ?`
      ).run([
        client_id || existing.client_id,
        event_date !== undefined ? event_date : existing.event_date,
        event_time !== undefined ? event_time : existing.event_time,
        event_address !== undefined ? event_address : existing.event_address,
        event_type !== undefined ? event_type : existing.event_type,
        subtotal,
        discount_percent != null ? discount_percent : existing.discount_percent,
        discountAmount,
        total,
        notes !== undefined ? notes : existing.notes,
        now,
        quoteId
      ]);

      // Delete old items and insert new ones
      db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run([quoteId]);
      for (const item of items) {
        const lineTotal = item.quantity * item.unit_price;
        db.prepare(
          'INSERT INTO quote_items (quote_id, item_id, description, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run([
          quoteId, item.item_id || null, item.description,
          item.quantity, item.unit_price, lineTotal, item.notes || null
        ]);
      }
    } else {
      // Update quote fields only (no items change)
      const now = new Date().toISOString();
      db.prepare(
        `UPDATE quotes SET client_id = ?, event_date = ?, event_time = ?, event_address = ?, event_type = ?,
         discount_percent = ?, notes = ?, updated_at = ?
         WHERE id = ?`
      ).run([
        client_id || existing.client_id,
        event_date !== undefined ? event_date : existing.event_date,
        event_time !== undefined ? event_time : existing.event_time,
        event_address !== undefined ? event_address : existing.event_address,
        event_type !== undefined ? event_type : existing.event_type,
        discount_percent != null ? discount_percent : existing.discount_percent,
        notes !== undefined ? notes : existing.notes,
        now,
        quoteId
      ]);
    }

    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all([quoteId]);
    res.json({ ...quote, items: quoteItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/quotes/:id/status - update status only
router.put('/:id/status', (req, res) => {
  try {
    const db = getDb();
    const quoteId = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'status es obligatorio' });

    const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    if (!existing) return res.status(404).json({ error: 'Cotizacion no encontrada' });

    const now = new Date().toISOString();
    db.prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?').run([status, now, quoteId]);

    // If status is 'Enviada', update client status and create follow-up reminder
    if (status === 'Enviada') {
      db.prepare('UPDATE clients SET status = ?, last_contact_date = ?, updated_at = ? WHERE id = ?').run([
        'Cotizado', new Date().toISOString().split('T')[0], now, existing.client_id
      ]);

      const followUpDate = addDays(new Date().toISOString().split('T')[0], 3);
      db.prepare(
        `INSERT INTO reminders (client_id, quote_id, type, reminder_date, message_template, status, priority)
         VALUES (?, ?, 'follow_up_quote', ?, ?, 'Pendiente', 'Alta')`
      ).run([
        existing.client_id, quoteId, followUpDate,
        'Seguimiento de cotizacion ' + existing.quote_number
      ]);
    }

    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/quotes/:id/convert - convert quote to invoice
router.post('/:id/convert', (req, res) => {
  try {
    const db = getDb();
    const quoteId = Number(req.params.id);
    const { advance_payment, notes } = req.body;

    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    if (!quote) return res.status(404).json({ error: 'Cotizacion no encontrada' });
    if (quote.status === 'Convertida') return res.status(400).json({ error: 'La cotizacion ya fue convertida' });

    // Generate invoice number
    const lastInvoice = db.prepare(
      "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
    ).get();
    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoice_number) {
      const parts = lastInvoice.invoice_number.split('-');
      nextNum = parseInt(parts[1], 10) + 1;
    }
    const invoiceNumber = `NOTA-${String(nextNum).padStart(4, '0')}`;

    const advPayment = advance_payment || 0;
    const remaining = quote.total - advPayment;
    const paymentStatus = advPayment >= quote.total ? 'Pagado' : (advPayment > 0 ? 'Anticipo' : 'Pendiente');

    // Create invoice
    const invoiceResult = db.prepare(
      `INSERT INTO invoices (invoice_number, quote_id, client_id, event_date, event_time, event_address, event_type,
       subtotal, discount_percent, discount_amount, total, advance_payment, remaining_payment, payment_status, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmada', ?)`
    ).run([
      invoiceNumber, quoteId, quote.client_id,
      quote.event_date, quote.event_time, quote.event_address, quote.event_type,
      quote.subtotal, quote.discount_percent, quote.discount_amount, quote.total,
      advPayment, remaining, paymentStatus,
      notes || quote.notes
    ]);

    const invoiceId = invoiceResult.lastInsertRowid;

    // Copy quote items to invoice items
    const quoteItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?').all([quoteId]);
    for (const item of quoteItems) {
      db.prepare(
        'INSERT INTO invoice_items (invoice_id, item_id, description, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run([invoiceId, item.item_id, item.description, item.quantity, item.unit_price, item.line_total, item.notes]);
    }

    // Update quote status to 'Convertida'
    const now = new Date().toISOString();
    db.prepare('UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?').run(['Convertida', now, quoteId]);

    // Update client status to 'Confirmado'
    db.prepare('UPDATE clients SET status = ?, updated_at = ? WHERE id = ?').run(['Confirmado', now, quote.client_id]);

    // Create auto reminders if event_date exists
    if (quote.event_date) {
      // 2 days before event
      const twoDaysBefore = addDays(quote.event_date, -2);
      db.prepare(
        `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
         VALUES (?, ?, 'pre_event', ?, 'Recordatorio: evento en 2 dias', 'Pendiente', 'Alta')`
      ).run([quote.client_id, invoiceId, twoDaysBefore]);

      // 1 day before event
      const oneDayBefore = addDays(quote.event_date, -1);
      db.prepare(
        `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
         VALUES (?, ?, 'pre_event', ?, 'Recordatorio: evento manana', 'Pendiente', 'Alta')`
      ).run([quote.client_id, invoiceId, oneDayBefore]);

      // Post-event follow-up (1 day after)
      const oneDayAfter = addDays(quote.event_date, 1);
      db.prepare(
        `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
         VALUES (?, ?, 'post_event', ?, 'Seguimiento post-evento', 'Pendiente', 'Normal')`
      ).run([quote.client_id, invoiceId, oneDayAfter]);

      // Payment reminder if there is remaining balance
      if (remaining > 0) {
        db.prepare(
          `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
           VALUES (?, ?, 'payment', ?, 'Recordatorio de pago pendiente', 'Pendiente', 'Alta')`
        ).run([quote.client_id, invoiceId, quote.event_date]);
      }
    }

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all([invoiceId]);
    res.status(201).json({ ...invoice, items: invoiceItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const quoteId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get([quoteId]);
    if (!existing) return res.status(404).json({ error: 'Cotizacion no encontrada' });

    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run([quoteId]);
    db.prepare('DELETE FROM reminders WHERE quote_id = ?').run([quoteId]);
    db.prepare('DELETE FROM quotes WHERE id = ?').run([quoteId]);
    res.json({ message: 'Cotizacion eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
