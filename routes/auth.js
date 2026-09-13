const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../config/dynamodb');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const existing = await docClient.send(new GetCommand({
      TableName: 'Users',
      Key: { email: email },
    }));

    if (existing.Item) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      email: email,
      password_hash: passwordHash,
      name: name || '',
      created_at: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: 'Users', Item: user }));

    res.status(201).json({
      message: 'User registered successfully',
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await docClient.send(new GetCommand({
      TableName: 'Users',
      Key: { email: email },
    }));

    const user = result.Item;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
