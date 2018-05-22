const config = require('./config.json');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const classes = sequelize.define('classes', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  user_id: Sequelize.INTEGER,
  job: Sequelize.TEXT,
  name: Sequelize.TEXT,
  avatar: Sequelize.TEXT,
  item_level: Sequelize.INTEGER,
}, {
  timestamps: false,
  tableName: "classes"
});

module.exports = classes;
