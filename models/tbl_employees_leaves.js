const { DataTypes } = require('sequelize');
const sequelize = require('../config/db_connection');

const EmployeeLeaves = sequelize().define('tbl_employee_leaves', {
  leave_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  emp_id: {
    type: DataTypes.STRING,
    // references: {
    //   model: 'tbl_employees_details',
    //   key: 'emp_id',
    // },
    allowNull: false,
  },
  leave_date: {
    type: DataTypes.DATE,
    primaryKey: true, // This makes leave_date part of the composite primary key
    allowNull: false,
    // validate: {
    //   isDate: true,
    //   //isAfter: new Date(),
    // },
  },
  // leave_type: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   validate: {
  //     isIn: [['Sick Leave', 'Vacation Leave', 'Personal Leave', 'Other']],
  //   },
  // },
  leave_reason: {
    type: DataTypes.TEXT,
    defaultValue: 'NA',
    validate: {
      len: [0, 500],
    },
  },
},
  {
    timestamps: false,
    schema: 'public',
    tableName: 'tbl_employee_leaves',
  }
);

module.exports = EmployeeLeaves;
