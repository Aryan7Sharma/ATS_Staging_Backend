const sequelize = require('../config/db_connection');
const { QueryTypes } = require("sequelize");
//const sequelize = require('sequelize');

async function getEmployeeAttendanceReport1Func(empID, startDate, endDate) {
  try {
    const [results, metadata] = await sequelize().query('SELECT * FROM get_employee_attendance_report1(:empID, :startDate, :endDate)', {
      replacements: { empID, startDate, endDate },
      type: QueryTypes.RAW,
    });

    return results;
  } catch (error) {
    console.error('Error executing the function:', error);
    throw error;
  }
}

module.exports= {
    getEmployeeAttendanceReport1Func
}