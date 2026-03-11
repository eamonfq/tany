const express = require('express');
const crypto = require('crypto');
const router = express.Router();

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

const USERS = [
  { username: 'tany', passwordHash: sha256('tany2025'), role: 'tany-admin', displayName: 'Tany (Admin)' },
  { username: 'usuario', passwordHash: sha256('eventos2025'), role: 'tany-user', displayName: 'Usuario' },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son obligatorios' });
  }

  const user = USERS.find(u => u.username === username && u.passwordHash === sha256(password));
  if (!user) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  res.json({ username: user.username, role: user.role, displayName: user.displayName });
});

module.exports = router;
