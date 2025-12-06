const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// In-memory users (no DB for now)
const users = [];

function makeToken(email) {
  return `dummy-token-for-${email}`;
}

/**
 * Register a user
 */
router.post('/register', (req, res) => {
  console.log('HIT /auth/register', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email & password required' });
  }

  const token = makeToken(email);
  users.push({ email, password });

  return res.status(201).json({ token });
});

/**
 * Login user
 */
router.post('/login', (req, res) => {
  console.log('HIT /auth/login', req.body);

  const { email, password } = req.body;

  const exists = users.find(
    u => u.email === email && u.password === password
  );

  if (!exists) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = makeToken(email);
  return res.json({ token });
});

module.exports = router;
