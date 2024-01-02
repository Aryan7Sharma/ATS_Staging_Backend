const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
// import middlewares
const validateBody = require("../middlewares/express_validator/validateBody");
// import controller
const authmainController = require("../controllers/auth/index")

// routes
router.post("/login",
[
    check('user_id').exists().isEmail().withMessage('Invalid user_id'),
    check('password').exists().isLength({mix:8,max:16}).withMessage('Invalid password'),
    //check('imei_num').exists().withMessage('Invalid IMEI Number'),
    //check('user_type').exists().isNumeric().withMessage('Invalid user type')
],validateBody,authmainController.login
);

router.post('/forgetpassword',
[
    check('user_id').exists().isEmail().withMessage('Invalid user_id'),
],validateBody,authmainController.forgetPassword
);


module.exports = router;
