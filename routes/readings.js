const express = require('express');
const { PutCommand, QueryCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('../config/dynamodb');
const {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand
} = require('@aws-sdk/client-athena');

const router = express.Router();
const athenaClient = new AthenaClient({
  region: 'us-east-1'
});

const ATHENA_DATABASE = 'iot_monitoring';
const ATHENA_OUTPUT = 's3://iot-monitoring-readings-tuananh-2026/athena-results/';
const waitForQuery = async (queryExecutionId) => {
  while (true) {
    const result = await athenaClient.send(
      new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId
      })
    );

    const state = result.QueryExecution.Status.State;

    if (state === 'SUCCEEDED') {
      return;
    }

    if (state === 'FAILED' || state === 'CANCELLED') {
      throw new Error(
        result.QueryExecution.Status.StateChangeReason ||
        `Athena query ${state}`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

router.get('/history', async (req, res) => {
  try {
    const { device_id, sensor_type } = req.query;

    let where = [];

    if (device_id) {
      where.push(`device_id = '${device_id}'`);
    }

    if (sensor_type) {
      where.push(`sensor_type = '${sensor_type}'`);
    }

    const whereClause =
      where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const query = `
      SELECT
        device_id,
        recorded_at,
        sensor_type,
        value,
        unit
      FROM ${ATHENA_DATABASE}.sensor_readings
      ${whereClause}
      ORDER BY recorded_at ASC
      LIMIT 100
    `;

    const startResult = await athenaClient.send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: {
          Database: ATHENA_DATABASE
        },
        ResultConfiguration: {
          OutputLocation: ATHENA_OUTPUT
        }
      })
    );

    const queryExecutionId = startResult.QueryExecutionId;

    await waitForQuery(queryExecutionId);

    const result = await athenaClient.send(
      new GetQueryResultsCommand({
        QueryExecutionId: queryExecutionId
      })
    );

    const rows = result.ResultSet.Rows || [];

    const data = rows.slice(1).map(row => {
      const cols = row.Data || [];

      return {
        device_id: cols[0]?.VarCharValue || null,
        recorded_at: cols[1]?.VarCharValue || null,
        sensor_type: cols[2]?.VarCharValue || null,
        value: Number(cols[3]?.VarCharValue),
        unit: cols[4]?.VarCharValue || null
      };
    });

    res.json(data);
  } catch (error) {
    console.error('Athena history error:', error);

    res.status(500).json({
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const deviceId = req.body.device_id;
    const sensorType = req.body.sensor_type;
    const value = req.body.value;
    const unit = req.body.unit;

    if (!deviceId || !sensorType || value === undefined) {
      return res.status(400).json({
        error: 'device_id, sensor_type, and value are required'
      });
    }

    const recordedAt = new Date().toISOString();

    const reading = {
      device_id: deviceId,
      recorded_at: recordedAt,
      sensor_type: sensorType,
      value: value,
      unit: unit,
    };

    await docClient.send(new PutCommand({
      TableName: 'SensorReadings',
      Item: reading,
    }));

    const thresholdResult = await docClient.send(new GetCommand({
      TableName: 'Thresholds',
      Key: { sensor_type: sensorType },
    }));

    const threshold = thresholdResult.Item;
    let alert = null;

    if (threshold) {
      const tooLow = threshold.min_value !== undefined && value < threshold.min_value;
      const tooHigh = threshold.max_value !== undefined && value > threshold.max_value;

      if (tooLow || tooHigh) {
        let message = '';

        if (tooLow) {
          message = sensorType + ' is too LOW: ' + value + ' (min allowed: ' + threshold.min_value + ')';
        } else {
          message = sensorType + ' is too HIGH: ' + value + ' (max allowed: ' + threshold.max_value + ')';
        }

        alert = {
          device_id: deviceId,
          triggered_at: new Date().toISOString(),
          sensor_type: sensorType,
          value: value,
          message: message,
          severity: 'warning',
        };

        await docClient.send(new PutCommand({
          TableName: 'AlertLogs',
          Item: alert,
        }));
      }
    }

    res.status(201).json({
      message: 'Reading saved successfully',
      reading: reading,
      alert_triggered: alert !== null,
      alert: alert,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const deviceId = req.query.device_id;

    if (deviceId) {
      const result = await docClient.send(new QueryCommand({
        TableName: 'SensorReadings',
        KeyConditionExpression: 'device_id = :d',
        ExpressionAttributeValues: {
          ':d': deviceId
        },
        ScanIndexForward: false,
        Limit: 10
      }));

      return res.json({
        readings: result.Items || []
      });
    }

    const result = await docClient.send(new ScanCommand({
      TableName: 'SensorReadings'
    }));

    const readings = (result.Items || [])
      .sort((a, b) => {
        return new Date(b.recorded_at) - new Date(a.recorded_at);
      })
      .slice(0, 10);

    res.json({
      readings: readings
    });

  } catch (err) {
    console.error('Get readings error:', err);

    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;