"use strict";

const fs = require('fs');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('re0pcDB', 'stg', 'Greedisgood', {
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

const inject = (file) => {

};

module.exports = {
  inject,
};