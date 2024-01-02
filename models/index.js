const loginsModel = require('./tbl_login_credentials');
const siteslocationModel = require('./tbl_siteslocation_details');
const departmentsModel = require('./tbl_departments_details');
const employeesModel = require('./tbl_employees_details');
const employeesattendanceModel = require('./tbl_employees_attendance');
const empAttenSummaryModel = require('./tbl_employees_attendance_summary');
const empLeavesModel = require('./tbl_employees_leaves');


module.exports = {
    loginsModel,
    siteslocationModel,
    departmentsModel,
    employeesModel,
    employeesattendanceModel,
    empAttenSummaryModel,
    empLeavesModel
}