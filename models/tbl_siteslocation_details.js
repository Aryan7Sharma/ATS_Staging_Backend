const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');

const SitesLocationDetails = sequelize().define(
  'tbl_siteslocation_details',
  {
    location_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_alias: {
      type: DataTypes.STRING,
      defaultValue: 'NA'
    },
    creater_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NA'
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    active_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: false,
    schema: 'public',
    tableName: 'tbl_siteslocation_details',
  }
);

module.exports = SitesLocationDetails;
