const sequelize = require('../config/database');
const SensorReading = require('./SensorReading');
const AlertLog = require('./AlertLog');
const Threshold = require('./Threshold');

module.exports = { sequelize, SensorReading, AlertLog, Threshold };