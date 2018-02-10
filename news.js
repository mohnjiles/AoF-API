const config = require('./config.json');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const news = sequelize.define('news', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  title: Sequelize.TEXT,
  content: Sequelize.TEXT('long'),
}, {
  timestamps: true
});

module.exports = news;
