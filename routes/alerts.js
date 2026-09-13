const express = require('express');
const { QueryCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const authenticate = require('../middleware/auth');
const docClient = require('../config/dynamodb');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const deviceId = req.query.device_id;

    if (deviceId) {
      const result = await docClient.send(new QueryCommand({
        TableName: 'AlertLogs',
        KeyConditionExpression: 'device_id = :d',
        ExpressionAttributeValues: { ':d': deviceId },
        ScanIndexForward: false,
      }));

      return res.json({ alerts: result.Items });
    }

    const result = await docClient.send(new ScanCommand({
      TableName: 'AlertLogs',
    }));

    res.json({ alerts: result.Items });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/count', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: 'AlertLogs',
      Select: 'COUNT',
    }));

    res.json({ total_alerts: result.Count });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:deviceId/:triggeredAt', authenticate, async (req, res) => {
  try {
    const deviceId = req.params.deviceId;
    const triggeredAt = decodeURIComponent(req.params.triggeredAt);

    await docClient.send(new DeleteCommand({
      TableName: 'AlertLogs',
      Key: {
        device_id: deviceId,
        triggered_at: triggeredAt,
      },
    }));

    res.json({ message: 'Alert deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;