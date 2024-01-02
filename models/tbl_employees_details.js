const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');
const DepartmentsDetails = require('./tbl_departments_details');

const EmployeesDetails = sequelize().define(
  'tbl_employees_details',
  {
    emp_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    emp_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emp_phoneno: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emp_emailid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emp_phone_imeino: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DepartmentsDetails,
        key: 'department_id',
      },
    },
    emp_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_img_path:{
      type: DataTypes.STRING,
      defaultValue:'NA',
    },
    emp_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    emp_joiningdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    emp_leavingdate: {
      type: DataTypes.DATE,
    },
    emp_status: {
      type: DataTypes.INTEGER,
      defaultValue:1,
    },
    creater_id:{
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:'NA'
    },
    creation_date:{
      type:DataTypes.DATE,
      allowNull:false
    },
    emp_degination:{
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:'NA'
    },
  },
  {
    timestamps: false,
    schema: 'public',
    tableName: 'tbl_employees_details',
  }
);

module.exports = EmployeesDetails;
