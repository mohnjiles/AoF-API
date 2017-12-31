const config = require('./config.json');

const Sequelize = require('sequelize');
const sequelize = new Sequelize("DiscordAnalytics", config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const SteamGames = sequelize.define('SteamGames', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  json: Sequelize.STRING
}, {
  timestamps: false
});
module.exports = SteamGames;
