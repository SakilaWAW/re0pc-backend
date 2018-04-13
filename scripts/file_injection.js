"use strict";

const fs = require('fs');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('re0pcDB', 'stg', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

sequelize.authenticate()
  .then(() => {
    console.log('success!');
  });

const inject = (file) => {

};

module.exports = {
  inject,
};