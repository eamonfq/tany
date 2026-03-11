const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const requireAdmin = require('../middleware/requireAdmin');

// Helper: add days to a date string
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Helper: generate next invoice number NOTA-NNNN
function generateInvoiceNumber(db) {
  const last = db.prepare(
    "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
  ).get();
  let nextNum = 1;
  if (last && last.invoice_number) {
    const parts = last.invoice_number.split('-');
    nextNum = parseInt(parts[1], 10) + 1;
  }
  return `NOTA-${String(nextNum).padStart(4, '0')}`;
}

// Helper: calculate totals from items array
function calculateTotals(items, discountPercent) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountAmount = subtotal * (discountPercent || 0) / 100;
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}

// GET /api/invoices/next-number
router.get('/next-number', (req, res) => {
  try {
    const db = getDb();
    const invoiceNumber = generateInvoiceNumber(db);
    res.json({ invoiceNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/invoices - List all invoices, optional ?status= and ?payment_status=
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status, payment_status } = req.query;
    let sql = `SELECT i.*, c.name as client_name, c.phone as client_phone
               FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE 1=1`;
    const params = [];

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }
    if (payment_status) {
      sql += ' AND i.payment_status = ?';
      params.push(payment_status);
    }
    sql += ' ORDER BY i.created_at DESC';

    const invoices = db.prepare(sql).all(params);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/invoices/:id - includes invoice_items
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const invoiceId = Number(req.params.id);
    const invoice = db.prepare(
      `SELECT i.*, c.name as client_name, c.phone as client_phone, c.email as client_email, c.address as client_address
       FROM invoices i LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`
    ).get([invoiceId]);

    if (!invoice) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    const items = db.prepare(
      `SELECT ii.*, it.name as item_name, it.category as item_category, it.image_url as item_image_url
       FROM invoice_items ii LEFT JOIN items it ON ii.item_id = it.id
       WHERE ii.invoice_id = ? ORDER BY ii.id`
    ).all([invoiceId]);

    res.json({ ...invoice, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/invoices - create invoice with items
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { client_id, event_date, event_time, event_address, event_type, discount_percent, advance_payment, notes, client_notes, items } = req.body;

    if (!client_id || !event_date || !event_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'client_id, event_date, event_address e items son obligatorios' });
    }

    const invoiceNumber = generateInvoiceNumber(db);
    const { subtotal, discountAmount, total } = calculateTotals(items, discount_percent);
    const advPayment = advance_payment || 0;
    const remaining = total - advPayment;
    const paymentStatus = advPayment >= total ? 'Pagado' : (advPayment > 0 ? 'Anticipo' : 'Pendiente');

    const result = db.prepare(
      `INSERT INTO invoices (invoice_number, client_id, event_date, event_time, event_address, event_type,
       subtotal, discount_percent, discount_amount, total, advance_payment, remaining_payment, payment_status, status, notes, client_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmada', ?, ?)`
    ).run([
      invoiceNumber, client_id, event_date, event_time || null,
      event_address, event_type || null,
      subtotal, discount_percent || 0, discountAmount, total,
      advPayment, remaining, paymentStatus,
      notes || null, client_notes || null
    ]);

    const invoiceId = result.lastInsertRowid;

    // Insert invoice items
    for (const item of items) {
      const lineTotal = item.quantity * item.unit_price;
      db.prepare(
        'INSERT INTO invoice_items (invoice_id, item_id, description, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run([
        invoiceId, item.item_id || null, item.description,
        item.quantity, item.unit_price, lineTotal, item.notes || null
      ]);
    }

    // Create auto reminders
    // 2 days before event
    const twoDaysBefore = addDays(event_date, -2);
    db.prepare(
      `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
       VALUES (?, ?, 'pre_event', ?, 'Recordatorio: evento en 2 dias', 'Pendiente', 'Alta')`
    ).run([client_id, invoiceId, twoDaysBefore]);

    // 1 day before event
    const oneDayBefore = addDays(event_date, -1);
    db.prepare(
      `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
       VALUES (?, ?, 'pre_event', ?, 'Recordatorio: evento manana', 'Pendiente', 'Alta')`
    ).run([client_id, invoiceId, oneDayBefore]);

    // Post-event follow-up (1 day after)
    const oneDayAfter = addDays(event_date, 1);
    db.prepare(
      `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
       VALUES (?, ?, 'post_event', ?, 'Seguimiento post-evento', 'Pendiente', 'Normal')`
    ).run([client_id, invoiceId, oneDayAfter]);

    // Payment reminder if there is remaining balance
    if (remaining > 0) {
      db.prepare(
        `INSERT INTO reminders (client_id, invoice_id, type, reminder_date, message_template, status, priority)
         VALUES (?, ?, 'payment', ?, 'Recordatorio de pago pendiente', 'Pendiente', 'Alta')`
      ).run([client_id, invoiceId, event_date]);
    }

    // Update client status
    const now = new Date().toISOString();
    db.prepare('UPDATE clients SET status = ?, updated_at = ? WHERE id = ?').run(['Confirmado', now, client_id]);

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all([invoiceId]);
    res.status(201).json({ ...invoice, items: invoiceItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/invoices/:id - update invoice data
router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const invoiceId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    if (!existing) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    const { client_id, event_date, event_time, event_address, event_type, discount_percent, notes, client_notes, items } = req.body;
    const now = new Date().toISOString();

    if (items && items.length > 0) {
      const { subtotal, discountAmount, total } = calculateTotals(items, discount_percent != null ? discount_percent : existing.discount_percent);
      const remaining = total - (existing.advance_payment || 0);
      const paymentStatus = existing.advance_payment >= total ? 'Pagado' : (existing.advance_payment > 0 ? 'Anticipo' : 'Pendiente');

      db.prepare(
        `UPDATE invoices SET client_id = ?, event_date = ?, event_time = ?, event_address = ?, event_type = ?,
         subtotal = ?, discount_percent = ?, discount_amount = ?, total = ?, remaining_payment = ?, payment_status = ?,
         notes = ?, client_notes = ?, updated_at = ?
         WHERE id = ?`
      ).run([
        client_id || existing.client_id,
        event_date || existing.event_date,
        event_time !== undefined ? event_time : existing.event_time,
        event_address || existing.event_address,
        event_type !== undefined ? event_type : existing.event_type,
        subtotal,
        discount_percent != null ? discount_percent : existing.discount_percent,
        discountAmount,
        total,
        remaining,
        paymentStatus,
        notes !== undefined ? notes : existing.notes,
        client_notes !== undefined ? client_notes : existing.client_notes,
        now,
        invoiceId
      ]);

      // Replace items
      db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run([invoiceId]);
      for (const item of items) {
        const lineTotal = item.quantity * item.unit_price;
        db.prepare(
          'INSERT INTO invoice_items (invoice_id, item_id, description, quantity, unit_price, line_total, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run([
          invoiceId, item.item_id || null, item.description,
          item.quantity, item.unit_price, lineTotal, item.notes || null
        ]);
      }
    } else {
      db.prepare(
        `UPDATE invoices SET client_id = ?, event_date = ?, event_time = ?, event_address = ?, event_type = ?,
         notes = ?, client_notes = ?, updated_at = ?
         WHERE id = ?`
      ).run([
        client_id || existing.client_id,
        event_date || existing.event_date,
        event_time !== undefined ? event_time : existing.event_time,
        event_address || existing.event_address,
        event_type !== undefined ? event_type : existing.event_type,
        notes !== undefined ? notes : existing.notes,
        client_notes !== undefined ? client_notes : existing.client_notes,
        now,
        invoiceId
      ]);
    }

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    const invoiceItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all([invoiceId]);
    res.json({ ...invoice, items: invoiceItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/invoices/:id/status - update status
router.put('/:id/status', (req, res) => {
  try {
    const db = getDb();
    const invoiceId = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'status es obligatorio' });

    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    if (!existing) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    const now = new Date().toISOString();
    db.prepare('UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?').run([status, now, invoiceId]);

    // If completed, update client status
    if (status === 'Completada') {
      db.prepare('UPDATE clients SET status = ?, updated_at = ? WHERE id = ?').run(['Completado', now, existing.client_id]);
    }

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/invoices/:id/payment - register payment
router.put('/:id/payment', (req, res) => {
  try {
    const db = getDb();
    const invoiceId = Number(req.params.id);
    const { amount, type } = req.body;

    if (amount == null || !type) {
      return res.status(400).json({ error: 'amount y type son obligatorios' });
    }
    if (type !== 'anticipo' && type !== 'liquidacion') {
      return res.status(400).json({ error: 'type debe ser "anticipo" o "liquidacion"' });
    }

    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    if (!existing) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    let newAdvance, newRemaining, paymentStatus;

    if (type === 'anticipo') {
      newAdvance = (existing.advance_payment || 0) + amount;
      newRemaining = existing.total - newAdvance;
      if (newRemaining <= 0) {
        newRemaining = 0;
        paymentStatus = 'Pagado';
      } else {
        paymentStatus = 'Anticipo';
      }
    } else {
      // liquidacion - full remaining payment
      newAdvance = existing.total;
      newRemaining = 0;
      paymentStatus = 'Pagado';
    }

    const now = new Date().toISOString();
    db.prepare(
      'UPDATE invoices SET advance_payment = ?, remaining_payment = ?, payment_status = ?, updated_at = ? WHERE id = ?'
    ).run([newAdvance, newRemaining, paymentStatus, now, invoiceId]);

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDb();
    const invoiceId = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM invoices WHERE id = ?').get([invoiceId]);
    if (!existing) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run([invoiceId]);
    db.prepare('DELETE FROM reminders WHERE invoice_id = ?').run([invoiceId]);
    db.prepare('DELETE FROM invoices WHERE id = ?').run([invoiceId]);
    res.json({ message: 'Nota de venta eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
