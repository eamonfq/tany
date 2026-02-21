const express = require('express');
const router = express.Router();

// GET /api/whatsapp/generate-link - generate wa.me link
router.get('/generate-link', (req, res) => {
  try {
    const { phone, message } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'phone es obligatorio' });
    }

    // Clean phone number: remove spaces, dashes, parentheses, and leading +
    let cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');

    // If phone doesn't start with country code, assume Mexico (52)
    if (cleanPhone.length === 10) {
      cleanPhone = '52' + cleanPhone;
    }

    let url = `https://wa.me/${cleanPhone}`;
    if (message) {
      url += `?text=${encodeURIComponent(message)}`;
    }

    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
