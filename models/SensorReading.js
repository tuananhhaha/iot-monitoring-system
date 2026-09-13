const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SensorReading = sequelize.define('SensorReading', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sensor_type: {
    type: DataTypes.STRING, // vd: 'temperature', 'humidity', 'air_quality'
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING, // vd: '°C', '%', 'ppm'
    allowNull: true,
  },
}, {
  tableName: 'sensor_readings',
  timestamps: true,
  createdAt: 'recorded_at',
  updatedAt: false,
});

module.exports = SensorReading;