const config = require('./config.json');
const character = require('./character');
const DKP = require('./dkp');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
  dialect: 'mysql',
  host: config.dbServer
});

const users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  name: Sequelize.TEXT,
  email: Sequelize.TEXT,
  admin: Sequelize.INTEGER,
  lodestone_id: Sequelize.TEXT,
  timezone: Sequelize.TEXT
}, {
  timestamps: false
});

users.hasMany(character, {foreignKey: "user_id", sourceKey: "id"});
users.hasOne(DKP, {foreignKey: "user_id", sourceKey: "id"});

module.exports = users;
