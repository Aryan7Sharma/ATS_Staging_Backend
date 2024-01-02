const { env } = process;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SecretKey = env.SECRET_KEY
// import models
const { loginsModel, employeesModel } = require('../../models/index');


const { generateNewPassword, hashPassword } = require("../../utils/index");
const { sendNewPassword } = require("../../utils/sendMail");


const login = async (req, res) => {
    try {
        const { user_id, password } = req.body;
        const user_login = await loginsModel.findByPk(user_id);
        if (!user_login || user_login?.emp_status!==1) { return res.status(404).send({ status: env.s404, msg: "User not found" }) };
        //if (user_login.imei_no != imei_num) { return res.status(401).send({ status: env.s401, msg: "IMEI Number does not Match!" }) };
        const matchPass = await bcrypt.compare(password, user_login.hash_password);
        if (!matchPass) { return res.status(422).json({ status: env.s422, msg: "Incorrect Password" }); };
        //if (user_login.emp_status !== 1) { return res.status(401).send({ status: env.s422, msg: "User Blocked by Admin" }) };
        const employee = await employeesModel.findOne({ where: { emp_emailid: user_id } });
        if (!employee || employee?.emp_status !== 1) { return res.status(404).json({ status: env.s404, msg: 'Employee Not Found or Its Blocked by Adminstraction!' }) };
        const login_count = user_login.login_count + 1;
        user_login.last_login = new Date();
        user_login.login_count = login_count;
        await user_login.save();
        const token = jwt.sign({ id: user_id }, SecretKey, { expiresIn: '2y' });
        const oneYear = 1000 * 60 * 60 * 24 * 365 * 2;
        res.cookie("token", token, {
            expires: new Date(Date.now() + oneYear),
            httpOnly: true,
        });
        return res.status(200).send({ status: env.s200, msg: "You Logged In Successfully!", data: { authToken: token, expires: Date.now() + oneYear, employee:employee } });
    } catch (error) {
        return res.status(500).send({ status: env.s500, msg: "Internal Server Error" });
    }
};

const forgetPassword = async (req, res) => {
    try {
        const { user_id } = req.body;
        const user = await loginsModel.findByPk(user_id);
        if (!user) { return res.status(404).send({ status: env.s404, msg: "User not found" }) };
        const newPassword = generateNewPassword();
        const hash_password = await hashPassword(newPassword); // convert plain password into hashpassword
        // Update the user's hashed password in the database
        const sendOtpResponce = await sendNewPassword(user_id, newPassword);
        if (!sendOtpResponce || sendOtpResponce.status !== "successfull") { res.status(417).json({ status: env.s417, msg: "Failed to Send New Password Over Mail Contact your Admin!" }); };
        user.hash_password = hash_password;
        await user.save();
        // sending final responce;
        res.status(200).json({ status: env.s200, msg: "New Passord Send into Your Registered Mail ID." });
    } catch (error) {
        res.status(500).json({ status: env.s500, msg: "Internal Server Error", error: error });
    }
};


module.exports = {
    login,
    forgetPassword,
}