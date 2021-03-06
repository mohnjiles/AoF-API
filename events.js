const config = require('./config.json');
const users = require('./users');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const Event = sequelize.define('event', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: Sequelize.TEXT,
  attendees: Sequelize.TEXT,
  min_ilvl: Sequelize.INTEGER,
  start_time: Sequelize.DATE,
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE
}, {
  timestamps: false,
  tableName: "events2"
});

// DKP.belongsTo(users, {foreignKey: 'user_id'})

module.exports = Event;
