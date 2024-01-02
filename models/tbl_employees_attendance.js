const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');
const SitesLocationDetails = require('./tbl_siteslocation_details');
const EmployeesDetails = require('./tbl_employees_details');

const EmployeesAttendance = sequelize().define(
  'tbl_employees_attendance',
  {
    attendance_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    atten_date:{
      type: DataTypes.DATE,
    },
    check_in_site_location_id: {
      type: DataTypes.INTEGER,
      allowNull : false,
      references: {
        model: SitesLocationDetails,
        key: 'location_id',
      },
    },
    check_out_site_location_id: {
      type: DataTypes.INTEGER,
      allowNull : true,
      references: {
        model: SitesLocationDetails,
        key: 'location_id',
      },
    },
    emp_id: {
      type: DataTypes.STRING,
      allowNull : false,
      references: {
        model: EmployeesDetails,
        key: 'emp_id',
      },
    },
    check_in: {
      type: DataTypes.DATE,
      allowNull : false,
    },
    check_out: {
      type: DataTypes.DATE,
      allowNull : true,
    },
    check_in_loc_dis_inmeter: {
      type: DataTypes.INTEGER,
      allowNull : false,
    },
    check_out_loc_dis_inmeter: {
      type: DataTypes.INTEGER,
      allowNull:true,
    },
    check_in_remark: {
      type: DataTypes.STRING,
    },
    check_out_remark: {
      type: DataTypes.STRING,
      defaultValue:'NA',
    },
  },
  {
    timestamps: false,
    schema: 'public',
    tableName: 'tbl_employees_attendance',
  }
);

module.exports = EmployeesAttendance;
