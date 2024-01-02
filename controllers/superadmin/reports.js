const { env } = process;
const logger = require('../../config/app_logger');
const {getEmployeeAttendanceReport1Func} = require("../../models/custom_functions");

const getEmployeeAttendanceReport1 = async (req, res) => {
    try {
        const {emp_id, start_date, end_date} = req.body;
        const attendata = await getEmployeeAttendanceReport1Func(emp_id, start_date, end_date);
        if(!attendata){return res.status(404).send({ status: env.s404, msg: "Employee Attendance Data Not Found", data:[] });};
        return res.status(200).send({ status: env.s200, msg: "Employee Attendance Data Fetched Successfully", data:attendata });
    } catch (error) {
        logger.error(`server error inside getEmployeeAttendanceReport1 Report controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const customReport2 = async (req, res) => {
    try {

    } catch (error) {
        logger.error(`server error inside customReport2 Report controller${error}`);
    }
}
const customReport3 = async (req, res) => {
    try {

    } catch (error) {
        logger.error(`server error inside customReport3 Report controller${error}`);
    }
}
const customReport4 = async (req, res) => {
    try {

    } catch (error) {
        logger.error(`server error inside customReport4 Report controller${error}`);
    }
}
const customReport5 = async (req, res) => {
    try {

    } catch (error) {
        logger.error(`server error inside customReport5 Report controller${error}`);
    }
}
module.exports = {
    getEmployeeAttendanceReport1,
    customReport2,
    customReport3,
    customReport4,
    customReport5
}