const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthStart = `${year}-${month}-01`;
    const nextMonth = now.getMonth() + 2 > 12
      ? `${year + 1}-01-01`
      : `${year}-${String(now.getMonth() + 2).padStart(2, '0')}-01`;

    // Events this month (invoices with event_date in current month)
    const eventsThisMonth = db.prepare(
      `SELECT COUNT(*) as count FROM invoices
       WHERE event_date >= ? AND event_date < ? AND status != 'Cancelada'`
    ).get([monthStart, nextMonth]);

    // Income this month (total from invoices created this month, excluding cancelled)
    const incomeThisMonth = db.prepare(
      `SELECT COALESCE(SUM(total), 0) as total FROM invoices
       WHERE created_at >= ? AND created_at < ? AND status != 'Cancelada'`
    ).get([monthStart, nextMonth]);

    // New clients this month
    const newClientsThisMonth = db.prepare(
      `SELECT COUNT(*) as count FROM clients
       WHERE created_at >= ? AND created_at < ? AND is_active = 1`
    ).get([monthStart, nextMonth]);

    // Pending payments (invoices with remaining > 0)
    const pendingPayments = db.prepare(
      `SELECT COALESCE(SUM(remaining_payment), 0) as total FROM invoices
       WHERE payment_status != 'Pagado' AND status != 'Cancelada'`
    ).get();

    res.json({
      eventsThisMonth: eventsThisMonth.count,
      incomeThisMonth: incomeThisMonth.total,
      newClientsThisMonth: newClientsThisMonth.count,
      pendingPayments: pendingPayments.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/upcoming-events - next 30 days invoices, or most recent if none upcoming
router.get('/upcoming-events', (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);
    const next30Str = next30.toISOString().split('T')[0];

    // First try upcoming events (next 30 days)
    let events = db.prepare(
      `SELECT i.*, c.name as client_name, c.phone as client_phone
       FROM invoices i LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.event_date >= ? AND i.event_date <= ?
       AND i.status != 'Completada' AND i.status != 'Cancelada'
       ORDER BY i.event_date ASC, i.event_time ASC
       LIMIT 10`
    ).all([today, next30Str]);

    // If no upcoming, show most recent non-cancelled events
    if (events.length === 0) {
      events = db.prepare(
        `SELECT i.*, c.name as client_name, c.phone as client_phone
         FROM invoices i LEFT JOIN clients c ON i.client_id = c.id
         WHERE i.status != 'Cancelada'
         ORDER BY i.event_date DESC
         LIMIT 5`
      ).all();
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/reminders-today
router.get('/reminders-today', (req, res) => {
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

// GET /api/dashboard/recent-activity - last 10 invoices + quotes
router.get('/recent-activity', (req, res) => {
  try {
    const db = getDb();

    const invoices = db.prepare(
      `SELECT i.id, i.invoice_number as number, 'invoice' as doc_type, i.status, i.total,
       i.created_at, c.name as client_name
       FROM invoices i LEFT JOIN clients c ON i.client_id = c.id
       ORDER BY i.created_at DESC LIMIT 10`
    ).all();

    const quotes = db.prepare(
      `SELECT q.id, q.quote_number as number, 'quote' as doc_type, q.status, q.total,
       q.created_at, c.name as client_name
       FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
       ORDER BY q.created_at DESC LIMIT 10`
    ).all();

    // Merge and sort by created_at descending, take top 10
    const activity = [...invoices, ...quotes]
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 10);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/monthly-metrics - income for last 6 months
router.get('/monthly-metrics', (req, res) => {
  try {
    const db = getDb();
    const metrics = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthStart = `${year}-${month}-01`;

      const nextD = new Date(year, d.getMonth() + 1, 1);
      const nextYear = nextD.getFullYear();
      const nextMo = String(nextD.getMonth() + 1).padStart(2, '0');
      const monthEnd = `${nextYear}-${nextMo}-01`;

      const result = db.prepare(
        `SELECT COALESCE(SUM(total), 0) as total FROM invoices
         WHERE created_at >= ? AND created_at < ? AND status != 'Cancelada'`
      ).get([monthStart, monthEnd]);

      metrics.push({
        month: `${year}-${month}`,
        total: result.total
      });
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
