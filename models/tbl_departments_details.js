const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');

const DepartmentsDetails = sequelize().define(
  'tbl_departments_details',
  {
    department_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    department_name: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: false,
    schema: 'public',
    tableName: 'tbl_departments_details',
  }
);

module.exports = DepartmentsDetails;
