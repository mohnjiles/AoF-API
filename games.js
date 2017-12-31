const config = require('./config.json');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const game = sequelize.define('game', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: Sequelize.TEXT,
  icon_url: Sequelize.TEXT,
  currently_playing: Sequelize.INTEGER,
}, {
  timestamps: false
});

module.exports = game;
