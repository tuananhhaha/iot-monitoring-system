const axios = require('axios');

const SERVER_URL = 'https://zbmor510pc.execute-api.us-east-1.amazonaws.com/readings';

const sensors = [
  { device_id: 'sensor-01', sensor_type: 'temperature', unit: 'C', min: 15, max: 40 },
  { device_id: 'sensor-02', sensor_type: 'humidity', unit: '%', min: 20, max: 90 },
  { device_id: 'sensor-03', sensor_type: 'air_quality', unit: 'ppm', min: 300, max: 800 },
];

function getRandomValue(min, max) {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * 10) / 10;
}

async function sendReading(sensor) {
  const value = getRandomValue(sensor.min, sensor.max);
  const payload = {
    device_id: sensor.device_id,
    sensor_type: sensor.sensor_type,
    value: value,
    unit: sensor.unit,
  };

  try {
    const response = await axios.post(SERVER_URL, payload);
    if (response.data.alert_triggered) {
      console.log('ALERT! ' + response.data.alert.message);
    } else {
      console.log(sensor.device_id + ' sent ' + value + sensor.unit + ' - OK');
    }
  } catch (err) {
    console.error('Failed to send data for ' + sensor.device_id + ':', err.message);
  }
}

function sendAllReadings() {
  sensors.forEach(sendReading);
}

console.log('Sensor simulation started. Sending data every 5 seconds...');
setInterval(sendAllReadings, 5000);
