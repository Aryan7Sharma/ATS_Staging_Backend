const { env } = process;
const { check } = require('express-validator');
const logger = require('../../config/app_logger');
const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const date = new Date();
const indianTimeDate = moment(date, 'YYYY-MM-DD HH:mm:ss.SSS').tz('Asia/Kolkata');
const currentTimeUTC = new Date();
// Adjust the time zone to IST (UTC+5:30)
const currentTimeIST = new Date(currentTimeUTC.getTime() + 330 * 60 * 1000);

// import models
const { employeesModel, employeesattendanceModel, empLeavesModel, empAttenSummaryModel, siteslocationModel, departmentsModel } = require('../../models/index');
// import common func
const { generateNewPassword, hashPassword } = require("../../utils/index");
const { sendNewPassword } = require("../../utils/sendMail");

const checkIn = async (req, res) => {
    try {
        const indianTimeDate = moment(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS').tz('Asia/Kolkata');
        const { site_location_id, location_distance_bykm } = req.body;
        const user_login = req.user;
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const currentDate = new Date().toISOString().split('T')[0];
        const checkAbsence = await empLeavesModel.findOne({
            where: {
                [Sequelize.Op.and]: [
                    { emp_id: employee.emp_id },

                    Sequelize.literal(`DATE(leave_date) = '${currentDate}'`)
                ]
            }
        });
        if (checkAbsence) {
            return res.status(422).json({ status: env.s422, msg: "You Can't Punch-In because you marked an Absence for today." });
        };
        const checkLastAttendance = await employeesattendanceModel.findOne({
            // where: {
            //     [Sequelize.Op.and]: [
            //         { emp_id: employee.emp_id },

            //         Sequelize.literal(`DATE(atten_date) = '${currentDate}'`)
            //     ]
            // }
            where: { emp_id: employee.emp_id },
            order: [['attendance_id', 'DESC']],
            limit: 1,
        });
        if (checkLastAttendance) {
            if (!checkLastAttendance.check_out) {
                return res.status(422).json({ status: env.s422, msg: "You didn't Punch Out Yet From You Last Attendance" })
            };

            let todayDate = moment(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS').tz('Asia/Kolkata');
            const twelveHours = moment.duration("12:00:00");
            todayDate.subtract(twelveHours);
            const lastPunchInTime = moment(checkLastAttendance.check_in, 'YYYY-MM-DD HH:mm:ss.SSS').tz('Asia/Kolkata');
            if (todayDate < lastPunchInTime) {
                return res.status(422).json({ status: env.s422, msg: 'You are Already Punch-In for Today.' })
            }
        }
        const remark = location_distance_bykm > 1000 ? `PunchIn Distance is Greater Than 1000 Meter -- ${location_distance_bykm}.` : `PunchIn Distance is Less Than 1000 Meter -- ${location_distance_bykm}.`;
        const empAttendanceData = {
            atten_date: indianTimeDate,
            check_in_site_location_id: site_location_id,
            emp_id: employee.emp_id,
            check_in: indianTimeDate,
            check_in_loc_dis_inmeter: parseInt(location_distance_bykm),
            check_in_remark: remark
        }
        const checkInData = await employeesattendanceModel.create(empAttendanceData);
        if (!checkInData) { return res.status(424).json({ status: env.s424, msg: 'PunchIn Failed!, try again' }) };
        const empAttenSummary = await empAttenSummaryModel.findOne({
            where: {
                atten_date: indianTimeDate,
                emp_id: employee.emp_id,
            }
        })
        if (!empAttenSummary) {
            const empAttenSummaryData = {
                atten_date: indianTimeDate,
                emp_id: employee.emp_id,
                first_check_in: indianTimeDate,
                last_check_in: indianTimeDate
            }
            await empAttenSummaryModel.create(empAttenSummaryData);
        } else {
            empAttenSummary.last_check_in = indianTimeDate;
            await empAttenSummary.save();
        }
        const respData = { attendanceId: checkInData.attendance_id, site_location_id: checkInData.site_location_id, punchInDateTime: checkInData.check_in }
        return res.status(200).send({ status: env.s200, msg: "You PunchIn Successfully!", data: respData });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const checkOut = async (req, res) => {
    try {
        const indianTimeDate = moment(new Date(), 'YYYY-MM-DD HH:mm:ss.SSS').tz('Asia/Kolkata');
        const { site_location_id, location_distance_bykm, attendance_id } = req.body;
        const user_login = req.user;
        //const empAttendanceData = await employeesattendanceModel.findByPk(attendance_id);
        //if (!empAttendanceData) { return res.status(404).json({ status: env.s404, msg: 'Your PunchIn Details Does Not Exist!' }) };
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const currentDate = new Date().toISOString().split('T')[0];
        const checkLastAttendance = await employeesattendanceModel.findOne({
            where: {
                emp_id: employee.emp_id,
                check_out: {
                    [Sequelize.Op.eq]: null,
                },
            },
            order: [['attendance_id', 'DESC']],
            limit: 1,

        });
        if (!checkLastAttendance) { return res.status(422).json({ status: env.s422, msg: "You didn't Punch-In Yet." }) };
        //if (checkLastAttendance.check_out) { return res.status(422).json({ status: env.s422, msg: "You Already Punch-Out For Today." }) };
        const remark = location_distance_bykm > 1000 ? `PunchOut Distance is Greater Than 1000 Meter -- ${location_distance_bykm}. ` : `PunchOut Distance is Less Than 1000 Meter -- ${location_distance_bykm}.`;
        checkLastAttendance.check_out = indianTimeDate;
        checkLastAttendance.check_out_loc_dis_inmeter = parseInt(location_distance_bykm);
        checkLastAttendance.remark = remark;
        checkLastAttendance.check_out_site_location_id = site_location_id;
        checkLastAttendance.check_out_remark = remark;
        await checkLastAttendance.save();
        const empAttenSummary = null;//await empAttenSummaryModel.findOne({
        //     where: {
        //         atten_date: indianTimeDate,
        //         emp_id: employee.emp_id,
        //     }
        // })
        if (empAttenSummary) {
            const lastCheckIn = await empAttenSummary.last_check_in;
            const currentTime = indianTimeDate;
            const minutesOnSite = empAttenSummary.total_minutes_on_site || 0;

            // Calculate the time difference in milliseconds
            const timeDifference = currentTime - lastCheckIn;
            // Convert milliseconds to minutes
            const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));
            // Update the total minutes on site
            empAttenSummary.last_check_out = currentTime;
            empAttenSummary.total_minutes_on_site = minutesOnSite + timeDifferenceInMinutes;
            await empAttenSummary.save();

        }
        return res.status(200).send({ status: env.s200, msg: "You PunchOut Successfully!", data: [] });
    } catch (error) {
        console.log("err", error);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const markLeave = async (req, res) => {
    try {
        const { site_location_id, location_distance_bykm, attendance_id } = req.body;
        const user_login = req.user;
        const empAttendanceData = await employeesattendanceModel.findByPk(attendance_id);
        if (!empAttendanceData) { return res.status(404).json({ status: env.s404, msg: 'Your PunchIn Details Does Not Exist!' }) };
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        let remark = '';
        if (empAttendanceData.site_location_id !== site_location_id) { remark = `Red Flag Employee PuchIn From Location ID ${empAttendanceData.site_location_id}  and PunchOut From Location ID ${site_location_id} both are Different.` }
        else { remark = `${empAttendanceData.remark} and Punch Out Distance is ${location_distance_bykm}.` }
        empAttendanceData.check_out = currentTimeIST;
        empAttendanceData.check_out_location_distance_bykm = parseInt(location_distance_bykm);
        empAttendanceData.remark = remark;
        await empAttendanceData.save();
        return res.status(200).send({ status: env.s200, msg: "You PunchOut Successfully!", data: {} });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const getEmpLastTenAttendanceRecord = async (req, res) => {
    try {
        const user_login = req.user;
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const empAttendancesData = await employeesattendanceModel.findAll({
            where: { emp_id: employee?.emp_id },
            order: [['attendance_id', 'DESC']],
            limit: 10,
        });
        // const empAttendancesData = await employeesattendanceModel.findAll({
        //     where: {
        //       emp_id: employee?.emp_id,
        //     },
        //     include: [
        //       {
        //         model: siteslocationModel,
        //         where: { location_id: Sequelize.col('attendance.check_in_site_location_id') },
        //       },
        //     ],
        //     order: [['attendance_id', 'DESC']],
        //     limit: 10,
        //   })
        if (!empAttendancesData) { return res.status(404).json({ status: env.s404, msg: 'Employees Attendance Record Not Found!' }) };
        return res.status(200).send({ status: env.s200, msg: "Employees Attendance Found Successfully!", data: empAttendancesData });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const forgetPassword = async (req, res) => {
    try {
        const user_login = req.user;
        const newPassword = generateNewPassword();
        const hash_password = await hashPassword(newPassword); // convert plain password into hashpassword
        // Update the user's hashed password in the database
        const sendOtpResponce = await sendNewPassword(user_login.user_id, newPassword);
        if (!sendOtpResponce || sendOtpResponce.status !== "successfull") { res.status(417).json({ status: env.s417, msg: "Failed to Send New Password Over Mail Contact your Admin!" }); };
        user_login.hash_password = hash_password;
        await user_login.save();
        // sending final responce;
        res.status(200).json({ status: env.s200, msg: "New Passord Send into Your Registered Mail ID." });
    } catch (error) {
        res.status(500).json({ status: env.s500, msg: "Internal Server Error", error: error });
    }
};

const getAllSite = async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format
        const allSites = await siteslocationModel.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { active_status: 1 },
                    Sequelize.literal(`DATE(creation_date) = '${currentDate}'`)
                ]
            }
        });
        return res.status(200).send({ status: env.s200, msg: "All Sites Fetched Successfully", data: allSites });
    } catch (error) {
        logger.error(`server error inside getAllSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const getAllDept = async (req, res) => {
    try {
        const allDept = await departmentsModel.findAll();
        return res.status(200).send({ status: env.s200, msg: "All Departments Fetched Successfully", data: allDept });
    } catch (error) {
        logger.error(`server error inside getAllDept controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const markAbsence = async (req, res) => {
    try {
        const { leave_reason } = req.body;
        const user_login = req.user;
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const currentDate = new Date().toISOString().split('T')[0];
        const checkAbsence = await empLeavesModel.findOne({
            where: {
                [Sequelize.Op.and]: [
                    { emp_id: employee.emp_id },

                    Sequelize.literal(`DATE(leave_date) = '${currentDate}'`)
                ]
            }
        });
        if (checkAbsence) {
            return res.status(422).json({ status: env.s422, msg: "You already marked an Absence for today." });
        };
        const checkLastAttendance = await employeesattendanceModel.findOne({
            where: {
                [Sequelize.Op.and]: [
                    { emp_id: employee.emp_id },

                    Sequelize.literal(`DATE(atten_date) = '${currentDate}'`)
                ]
            }
        });
        if (checkLastAttendance) {
            return res.status(422).json({ status: env.s422, msg: 'You marked an attendance today. Consequently, marking absence for the same day is not permitted.' })
        }
        const leaveData = {
            emp_id: employee.emp_id,
            leave_date: currentTimeIST,
            leave_reason: leave_reason || 'NA'
        }
        await empLeavesModel.create(leaveData);
        return res.status(200).send({ status: env.s200, msg: "Leave Marked Successfully", data: { 'status': 'done' } });
    } catch (error) {
        logger.error(`server error inside markAbsence controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const getEmps = async (req, res) => {
    try {
        const { user_role, dept_id } = req.body;
        if (user_role === 0 || user_role === 1) {
            const empData = await employeesModel.findAll({
                where: {
                    emp_type: {
                        [Sequelize.Op.gt]: 1
                    }
                },
                attributes: ['emp_id', 'emp_name', 'department_id'],
            });
            if (!empData) { return res.status(401).send({ status: env.s401, msg: "Employees Not Found", data: [] }); };
            return res.status(200).send({ status: env.s200, msg: "Employees Found Successfully!", data: empData });
        } else if (user_role === 2) {
            if (!dept_id) { return res.status(422).send({ status: env.s422, msg: "Invalid Department ID", data: [] }); }
            const empData = await employeesModel.findAll({
                where: {
                    emp_type: {
                        [Sequelize.Op.gt]: 1
                    },
                    department_id: dept_id
                },
                attributes: ['emp_id', 'emp_name', 'department_id'],
            });
            if (!empData) { return res.status(401).send({ status: env.s401, msg: "Employees Not Found", data: [] }); }
            return res.status(200).send({ status: env.s200, msg: "Employees Found Successfully!", data: empData });
        } else {
            return res.status(401).send({ status: env.s401, msg: "You are Unauthorized", data: {} });
        }

    } catch (error) {
        logger.error(`server error inside getAllSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}

const empAttendanceData = async (req, res) => {
    try {
        const { emp_id, startDate, endDate } = req.body;
        const empAttenData = await employeesattendanceModel.findAll({
            where: {
                emp_id: emp_id,
                atten_date: {
                    [Sequelize.Op.between]: [startDate, endDate],
                },
            }
        })
        if (!empAttenData) { return res.status(401).send({ status: env.s401, msg: "Employees Attendance Data Not Found", data: [] }); }
        return res.status(200).send({ status: env.s200, msg: "Employees Attendance Data Fetched Successfully", data: empAttenData });
    } catch (error) {
        logger.error(`server error inside empAttendanceData controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}

const createSite = async (req, res) => {
    try {
        const user = req.user;
        const { latitude, longitude, location_name, active_status } = req.body;
        const lat = parseFloat(latitude);
        const long = parseFloat(longitude);
        const siteData = {
            latitude: lat,
            longitude: long,
            location_name: location_name,
            creater_id: user?.user_id,
            creation_date: new Date(),
            active_status: active_status || 0,
        }
        const newSite = await siteslocationModel.create(siteData);
        return res.status(201).send({ status: env.s201, msg: "New Site Created Successfully", data: newSite });
    } catch (error) {
        logger.error(`server error inside createSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}

module.exports = {
    checkIn,
    checkOut,
    getEmpLastTenAttendanceRecord,
    forgetPassword,
    getAllSite,
    markAbsence,
    getEmps,
    empAttendanceData,
    getAllDept,
    createSite
}
