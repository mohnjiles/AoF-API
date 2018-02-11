const config = require('./config.json');
const users = require('./users');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const DKPEvent = sequelize.define('dkp-event', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  user_id: Sequelize.INTEGER,
  dkp_change: Sequelize.INTEGER,
  reason: Sequelize.TEXT,
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE
}, {
  timestamps: false,
  tableName: "dkp_events"
});

// DKP.belongsTo(users, {foreignKey: 'user_id'})

module.exports = DKPEvent;
