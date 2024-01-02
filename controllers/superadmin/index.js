const { env } = process;
const logger = require('../../config/app_logger');
const Sequelize = require('sequelize');
const sequelize = require('../../config/db_connection');
// import Models;
const { employeesModel, employeesattendanceModel, empLeavesModel, empAttenSummaryModel, loginsModel, siteslocationModel } = require('../../models/index');
// import utils func
const { hashPassword } = require("../../utils/index");

const createEmployee = async (req, res) => {
    try {
        const { emp_id, emp_name, emp_phoneno, emp_emailid, emp_phone_imeino, emp_address, emp_joiningdate, password, emp_degination } = req.body;
        profile_img_path = 'NA';
        if (req.file) {
            const uploadProfileImage = req.file;
            //console.log(uploadProfileImage);
            profile_img_path = uploadProfileImage?.filename;
        }
        const emp_type = parseInt(req.body?.emp_type);
        const department_id = parseInt(req.body?.department_id);
        //console.log(emp_type)
        if (emp_type < 0 || emp_type > 3) { return res.status(422).send({ status: env.s422, msg: "Invalid Employee Type.", data: [] }); };
        const user = req.user;
        // check emp existance.
        const emp = await employeesModel.findByPk(emp_id);
        const loginCred = await loginsModel.findByPk(emp_emailid);
        if (emp || loginCred) { return res.status(409).send({ status: env.s409, msg: "Employee already Exist", }) };
        const empData = {
            emp_id: emp_id,
            emp_name: emp_name,
            emp_phoneno: emp_phoneno,
            emp_emailid: emp_emailid,
            emp_phone_imeino: emp_phone_imeino || 123456789123456,
            department_id: department_id,
            emp_address: emp_address || 'NA',
            profile_img_path: profile_img_path || 'NA',
            emp_type: emp_type,
            emp_joiningdate: emp_joiningdate || new Date(),
            emp_status: 1,
            emp_degination: emp_degination,
            creater_id: user?.user_id,
            creation_date: new Date()
        };
        const hash_password = await hashPassword(password);

        const loginData = {
            user_id: emp_emailid,
            hash_password: hash_password,
            imei_no: emp_phone_imeino || 123456789123456,
            user_type: emp_type,
            emp_status: 1,
        };
        // Start a transaction
        const performTransaction = async () => {
            return new Promise(async (resolve, reject) => {
                try {
                    await sequelize().transaction(async (t) => {
                        await employeesModel.create(empData);
                        //console.log("done1");
                        await loginsModel.create(loginData);
                        await t.commit();// Commit the transaction
                        resolve({ "status": "committed" });// Resolve the Promise to indicate successful commit
                    });
                } catch (error) {
                    reject({ "status": "failed", "error": error });
                }
            });
        };
        const newEmp = await performTransaction();
        if (!newEmp) { return res.status(417).send({ status: env.s417, msg: "Failed to Create New Employee.", data: [] }); };
        //console.log("done");
        return res.status(201).send({ status: env.s201, msg: "New Employee Created Successfully", data: { msg: "Created Successfully" } });
    } catch (error) {
        //console.log(error);
        logger.error(`server error inside createEmployee controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const createSite = async (req, res) => {
    try {
        const user = req.user;
        const { latitude, longitude, location_name,location_alias } = req.body;
        const lat = parseFloat(latitude);
        const long = parseFloat(longitude);
        const siteData = {
            latitude: lat,
            longitude: long,
            location_name: location_name,
            creater_id: user?.user_id,
            creation_date: new Date(),
            location_alias:location_alias || 'NA',
        }
        const newSite = await siteslocationModel.create(siteData);
        return res.status(201).send({ status: env.s201, msg: "New Site Created Successfully", data: newSite });
    } catch (error) {
        logger.error(`server error inside createSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const updateEmployee = async (req, res) => {
    try {
        const { emp_name, emp_id, emp_email_id, emp_emailid, emp_phoneno, emp_address, emp_joiningdate, emp_degination, password } = req.body;
        const emp = await employeesModel.findByPk(emp_id);
        if (!emp_name || !emp_id || !emp_phoneno || !emp_address || !emp_joiningdate || !emp_degination) {
            return res.status(404).send({ status: env.s404, msg: "Some Fields are Empty!", data: [] });
        }
        if (!emp) {
            return res.status(404).send({ status: env.s404, msg: "Employee Details Not Found", data: {} });
        }
        const empLogin = await loginsModel.findByPk(emp?.emp_emailid);
        const emaild = emp_email_id || emp_emailid;
        let newPassword = null;
        if (password?.length > 8 && password?.length < 16) {
            const newhashpass = await hashPassword(password);
            newPassword = newhashpass;
        }
        if (newPassword) {
            empLogin.hash_password = newPassword;
            await empLogin.save();
        }
        if (emp.emp_emailid !== emaild) {
            if (!empLogin) {
                return res.status(404).send({ status: env.s404, msg: "Employee Login Credentials Not Found", data: {} });
            }
            // Create a new empLogin record with the updated user_id
            const newHashPass = newPassword || empLogin.hash_password;
            const newEmpLogin = await loginsModel.create({
                user_id: emp_email_id || emp_emailid,
                hash_password: newHashPass,
                imei_no: empLogin.imei_no,
                user_type: empLogin.user_type,
                emp_status: empLogin.emp_status,
            });
            // Save the changes
            await newEmpLogin.save();
            // Delete the old empLogin record
            await empLogin.destroy();
        }
        // Update the references in the employee record
        emp.emp_emailid = emp_email_id || emp_emailid;
        emp.emp_phoneno = emp_phoneno;
        emp.emp_name = emp_name;
        emp.emp_address = emp_address;
        emp.emp_degination = emp_degination;
        emp.emp_joiningdate = emp_joiningdate;
        await emp.save();
        return res.status(201).send({ status: env.s201, msg: "Employee Details Updated Successfully", data: emp });
    } catch (error) {
        //console.log(error);
        logger.error(`server error inside updateEmployee controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}

const updateSite = async (req, res) => {
    try {
        const { latitude, longitude, location_name, location_id } = req.body;
        const site = siteslocationModel.findByPk(location_id);
        if (!site) { return res.status(422).send({ status: env.s422, msg: "Failed to Fetch Site Details.", data: {} }) };
        site.latitude = latitude;
        site.longitude = longitude;
        site.location_name = location_name;
        await site.save();
        return res.status(200).send({ status: env.s200, msg: "Site Updated Successfully.", data: {} });
    } catch (error) {
        logger.error(`server error inside updateSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const getAllEmp = async (req, res) => {
    try {
        const allEmp = await employeesModel.findAll({
            where: {
                emp_type: {
                    [Sequelize.Op.gt]: 1
                }
            }
        });
        return res.status(200).send({ status: env.s200, msg: "All Employees Repord Fetched Successfully", data: allEmp });
    } catch (error) {
        logger.error(`server error inside getAllEmp controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const getAllSite = async (req, res) => {
    try {
        const allSites = await siteslocationModel.findAll();
        return res.status(200).send({ status: env.s200, msg: "All Sites Fetched Successfully", data: allSites });
    } catch (error) {
        logger.error(`server error inside getAllSite controller${error}`);
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
}
const getAttendanceData = async (req, res) => {
    try {
        const { emp_id } = req.body;
        const attendanceData = await employeesattendanceModel.findAll({
            where: {
                emp_id: emp_id
            }
        });
        return res.status(200).send({ status: env.s200, msg: "Attendance data Fetched Successfully.", data: attendanceData });
    } catch (error) {
        logger.error(`server error inside getAttendanceData controller${error}`);
    }
}

module.exports = {
    createEmployee,
    createSite,
    updateSite,
    updateEmployee,
    getAllSite,
    getAllEmp,
    getAttendanceData
}
