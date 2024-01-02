const jwt = require("jsonwebtoken");
const keysecret = process.env.SECRET_KEY
const { loginsModel } = require("../../models/index"); // Model
const logger = require('../../config/app_logger');
const { env } = process;

const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers?.authorization || req.headers?.Authorization || req.cookies?.token;
        if (!token) { return res.status(404).json({ status: env.s404, msg: 'Token not provided' }) };
        const decodetoken = jwt.verify(token, keysecret);
        if (!decodetoken?.id) { return res.status(401).json({ status: env.s401, msg: 'Decoding Token Failed!' }) };
        const user = await loginsModel.findByPk(decodetoken?.id);
        if (!user || user?.emp_status != 1 || user?.user_type < 0 || user?.user_type > 3) { return res.status(401).json({ status: env.s401, msg: 'You are not authorized user to access this!' }); };
        req.user = user;
        next();
    } catch (error) {
        //console.log("error", error)
        if (error.name === 'TokenExpiredError') { return res.status(401).json({ status: env.s401, msg: 'Token expired' }); };
        logger.error('Getting Error inside auth middleware', error)
        res.status(500).send({ statu: env.s500, msg: "Server Error!" })
    }
}

const verifyEmployee = async (req, res, next) => {
    try {
        const token = req.headers?.authorization || req.headers?.Authorization || req.cookies?.token || 'NA';
        //console.log(token, "token",req.headers, req.headers?.Authorization,req.cookies?.token);
        if (!token || token === 'NA') { return res.status(401).json({ status: env.s401, msg: 'Token not provided' }) };
        const decodetoken = jwt.verify(token, keysecret);
        //console.log("decodetoken",decodetoken)
        if (!decodetoken?.id) { return res.status(401).json({ status: env.s401, msg: 'Decoding Token Failed!' }) };
        const user = await loginsModel.findByPk(decodetoken?.id);
        if (!user || user?.emp_status != 1 || (user?.user_type !== 0 && user?.user_type !== 3)) { return res.status(401).json({ status: env.s401, msg: 'You are not authorized user to access this!' }); };
        req.user = user;
        //console.log("done")
        next();
    } catch (error) {
        //console.log("error", error)
        if (error.name === 'TokenExpiredError') { return res.status(401).json({ status: env.s401, msg: 'Token expired' }); };
        logger.error('Getting Error inside auth middleware', error)
        res.status(500).send({ statu: env.s500, msg: "Server Error!" })
    }
}

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers?.authorization || req.headers?.Authorization || req.cookies?.token;
        if (!token) { return res.status(401).json({ status: env.s401, msg: 'Token not provided' }) };
        const decodetoken = jwt.verify(token, keysecret);
        if (!decodetoken?.id) { return res.status(401).json({ status: env.s401, msg: 'Decoding Token Failed!' }) };
        const user = await loginsModel.findByPk(decodetoken?.id);
        if (!user || user?.emp_status != 1 || (user?.user_type !== 0 && user?.user_type !== 2)) { return res.status(401).json({ status: env.s401, msg: 'You are not authorized user to access this!' }); };
        req.user = user;
        next();
    } catch (error) {
        //console.log("error", error)
        if (error.name === 'TokenExpiredError') { return res.status(401).json({ status: env.s401, msg: 'Token expired' }); };
        logger.error('Getting Error inside auth middleware', error)
        res.status(500).send({ statu: env.s500, msg: "Server Error!" })
    }
}

const verifySuperAdmin = async (req, res, next) => {
    try {
        const token = req.headers?.authorization || req.headers?.Authorization || req.cookies?.token;
        //console.log(token,"token server");
        if (!token) { return res.status(401).json({ status: env.s401, msg: 'Token not provided' }) };
        const decodetoken = jwt.verify(token, keysecret);
        if (!decodetoken?.id) { return res.status(401).json({ status: env.s401, msg: 'Decoding Token Failed!' }) };
        const user = await loginsModel.findByPk(decodetoken?.id);
        if (!user || user?.emp_status != 1 || (user?.user_type !== 0 && user?.user_type !== 1)) { return res.status(401).json({ status: env.s401, msg: 'You are not authorized user to access this!' }); };
        req.user = user;
        next();
    } catch (error) {
        //console.log("error", error)
        if (error.name === 'TokenExpiredError') { return res.status(401).json({ status: env.s401, msg: 'Token expired' }); };
        logger.error('Getting Error inside auth middleware', error)
        res.status(500).send({ statu: env.s500, msg: "Server Error!" })
    }
}


module.exports = {
    verifyUser,
    verifyEmployee,
    verifyAdmin,
    verifySuperAdmin
}
