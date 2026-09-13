const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertLog = sequelize.define('AlertLog', {
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
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.STRING, // vd: 'warning', 'critical'
    defaultValue: 'warning',
  },
}, {
  tableName: 'alert_logs',
  timestamps: true,
  createdAt: 'triggered_at',
  updatedAt: false,
});

module.exports = AlertLog;