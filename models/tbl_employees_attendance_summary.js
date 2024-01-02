const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');

const EmployeeAttendanceSummary = sequelize().define('tbl_emp_attendance_summary', {
  atten_date: {
    type: DataTypes.DATE,
    primaryKey: true,
    allowNull: false,
  },
  emp_id: {
    type: DataTypes.STRING, // Adjust the data type based on your actual schema
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'tbl_employees_details',
      key: 'emp_id',
    },
  },
  first_check_in: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  last_check_out: {
    type: DataTypes.DATE,
    allowNull: true, 
  },
  last_check_in: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  total_minutes_on_site: {
    type: DataTypes.INTEGER, 
    defaultValue:0
  },
}, {
  tableName: 'tbl_emp_attendance_summary', // Specify the table name if it's different
  timestamps: false, // Disable createdAt and updatedAt columns
  uniqueKeys: {
    unique_attendance_summary: {
      fields: ['atten_date', 'emp_id'],
    },
  },
});

module.exports = EmployeeAttendanceSummary;
