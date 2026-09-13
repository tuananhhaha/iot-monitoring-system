const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Threshold = sequelize.define('Threshold', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sensor_type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  min_value: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  max_value: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'thresholds',
  timestamps: false,
});

module.exports = Threshold;