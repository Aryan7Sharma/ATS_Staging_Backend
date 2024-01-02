const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
//import utils
const {isValidLatitude, isValidLongitude} = require('../utils/index');
// import middlewares
const validateBody = require("../middlewares/express_validator/validateBody");
const {uploadProfileImage} = require("../middlewares/utils/uploadImage");
// import controller
const superadminmainController = require("../controllers/superadmin/index");
const superadminreportController = require("../controllers/superadmin/reports");

// routes
router.get("/getallsites",superadminmainController.getAllSite);
router.get("/getallemployees",superadminmainController.getAllEmp);
router.post("/updateemp",
[
    
],validateBody,superadminmainController.updateEmployee);
router.post("/addnewsite",
[
    check('latitude').exists().withMessage('Latitude is required').custom(isValidLatitude).withMessage('Invalid Latitude'),
    check('longitude').exists().withMessage('Longitude is required').custom(isValidLongitude).withMessage('Invalid Longitude'),
    check('location_name').exists().isLength({ min: 2, max: 256 }).withMessage('Invalid Site/Location Name'),   
],validateBody,superadminmainController.createSite);
router.post("/addnewemployee",uploadProfileImage,
[
    check('emp_id').exists().withMessage('emp_id is required'),
    check('emp_name').exists().withMessage('emp_name is required'),
    check('emp_phoneno').exists().withMessage('emp_phoneno is required').isLength({min:10,max:10}).withMessage('Invalid Phone No.'),
    check('emp_emailid').exists().withMessage('emp_name is required').isEmail().withMessage('Invalid Email Id'),
    check('emp_phone_imeino').exists().withMessage('emp_phone_imeino is required'),
    check('department_id').exists().withMessage('department_id is required'),
    check('emp_address').exists().withMessage('emp_address is required'),
    check('emp_type').exists().withMessage('emp_type is required'),
    check('emp_joiningdate').exists().withMessage('emp_joiningdate is required'),
    check('emp_degination').exists().withMessage('emp_degination is required'),
    check('password').exists().isLength({min:8,max:16}).withMessage('Invalid Password')   
],validateBody,superadminmainController.createEmployee);//emp_degination


router.post("/rep/empattenrep1",
[
    check('emp_id').exists().withMessage('EmpID is required').isLength({min:4}).withMessage('Invalid EmpID'),
    check('start_date').exists().withMessage('Start Date is required').isLength({min:10}).withMessage('Invalid Start Date'),
    check('end_date').exists().withMessage('End Date is required').isLength({min:10}).withMessage('Invalid End Date'),   
],validateBody,superadminreportController.getEmployeeAttendanceReport1);

module.exports = router;