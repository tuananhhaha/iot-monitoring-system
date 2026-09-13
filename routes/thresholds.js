const express = require('express');
const {
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const docClient = require('../config/dynamodb');
const authenticate = require('../middleware/auth');

const router = express.Router();


// ==============================
// CREATE / UPDATE THRESHOLD
// ==============================
router.post('/', authenticate, async (req, res) => {
  try {
    const sensorType = req.body.sensor_type;
    const minValue = req.body.min_value;
    const maxValue = req.body.max_value;

    if (!sensorType) {
      return res.status(400).json({
        error: 'sensor_type is required'
      });
    }

    const threshold = {
      sensor_type: sensorType,
      min_value: minValue,
      max_value: maxValue
    };

    await docClient.send(new PutCommand({
      TableName: 'Thresholds',
      Item: threshold
    }));

    res.status(201).json({
      message: 'Threshold saved successfully',
      threshold: threshold
    });

  } catch (err) {
    console.error('Save threshold error:', err);

    res.status(500).json({
      error: err.message
    });
  }
});


// ==============================
// GET ALL THRESHOLDS
// ==============================
router.get('/', async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: 'Thresholds'
    }));

    res.json({
      thresholds: result.Items || []
    });

  } catch (err) {
    console.error('Get thresholds error:', err);

    res.status(500).json({
      error: err.message
    });
  }
});


// ==============================
// DELETE THRESHOLD
// ==============================
router.delete('/:sensorType', authenticate, async (req, res) => {
  try {
    const sensorType = req.params.sensorType;

    if (!sensorType) {
      return res.status(400).json({
        error: 'sensor_type is required'
      });
    }

    await docClient.send(new DeleteCommand({
      TableName: 'Thresholds',
      Key: {
        sensor_type: sensorType
      }
    }));

    res.json({
      message: 'Threshold deleted successfully',
      sensor_type: sensorType
    });

  } catch (err) {
    console.error('Delete threshold error:', err);

    res.status(500).json({
      error: err.message
    });
  }
});


module.exports = router;