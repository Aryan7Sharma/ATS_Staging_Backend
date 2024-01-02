const { env } = process;
// import models
const { employeesModel, employeesattendanceModel } = require('../../models/index');

const checkIn = async (req, res) => {
    try {
        const { site_location_id, location_distance_bykm } = req.body;
        const user_login = req.user;
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const remark = location_distance_bykm > 1 ? 'PunchIn Distance is Greater Than 1Km.' : 'Green Flag PunchIn Distance is Less Than 1Km.';
        empAttendanceData = {
            site_location_id: site_location_id,
            emp_id: employee.emp_id,
            check_in: new Date(),
            check_in_location_distance_bykm: parseInt(location_distance_bykm),
            remark: remark
        }
        const checkInData = await employeesattendanceModel.create(empAttendanceData);
        if (!checkInData) { return res.status(424).json({ status: env.s424, msg: 'PunchIn Failed!, try again' }) };
        const respData = { attendanceId: checkInData.attendance_id, site_location_id: checkInData.site_location_id, punchInDateTime: checkInData.check_in }
        return res.status(200).send({ status: env.s200, msg: "You PunchIn Successfully!", data: respData });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const checkOut = async (req, res) => {
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
        empAttendanceData.check_out = new Date();
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
        const user_login = {'user_id':'sunny.rathor498@gmail.com'} //req.user;
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_login?.user_id } })
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const empAttendancesData = await employeesattendanceModel.findAll({ where:{emp_id:employee?.emp_id}});
        if (!empAttendancesData) { return res.status(404).json({ status: env.s404, msg: 'Employees Attendance Record Not Found!' }) };
        return res.status(200).send({ status: env.s200, msg: "Employees Attendance Found Successfully!", data: empAttendancesData });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};


module.exports = {
    checkIn,
    checkOut,
    getEmpLastTenAttendanceRecord
}



