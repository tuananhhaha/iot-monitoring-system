require('dotenv').config();
const { Sequelize } = require('sequelize');

// Phase 1 (local dev): SQLite — không cần cài DB server, chạy ngay được.
// Phase 2 (AWS): sẽ chuyển sang DynamoDB cho dữ liệu sensor real-time.

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;