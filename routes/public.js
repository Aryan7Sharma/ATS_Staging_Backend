const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {isValidLatitude, isValidLongitude} = require('../utils/index');
// import middlewares
const validateBody = require("../middlewares/express_validator/validateBody");

// import controller
const publicmainController = require("../controllers/public/index");

// routes
router.post('/punchIn',
    [
        check('site_location_id').exists().isNumeric().withMessage('Invalid site_location_id'),
        check('location_distance_bykm').exists().isNumeric().withMessage('Invalid location_distance_bykm'),
    ], validateBody, publicmainController.checkIn
);
router.post('/punchOut',
    [
        //check('attendance_id').exists().isNumeric().withMessage('Invalid Attendance ID.'),
        check('site_location_id').exists().isNumeric().withMessage('Invalid site_location_id'),
        check('location_distance_bykm').exists().isNumeric().withMessage('Invalid location_distance_bykm'),
    ], validateBody,
    publicmainController.checkOut
);
router.get('/emplasttenAttendanceRecord',
    publicmainController.getEmpLastTenAttendanceRecord
);

router.get('/forgetpassword', publicmainController.forgetPassword);
router.get("/getallsites", publicmainController.getAllSite);
router.get("/getalldept", publicmainController.getAllDept);
router.post("/markabsence", publicmainController.markAbsence);

router.post("/getemployees",
    [
        check('user_role').exists().isNumeric().withMessage('Invalid User Role!')
    ]
    , validateBody, publicmainController.getEmps);

router.post("/getempattendata",
    [
        check('emp_id').exists().withMessage('Invalid User Role!'),
        check('startDate').exists().withMessage('Invalid Start Date!'),
        check('endDate').exists().withMessage('Invalid End Date!')
    ]
    , validateBody, publicmainController.empAttendanceData);

router.post("/addnewsite",
    [
        check('latitude').exists().withMessage('Latitude is required'),//.custom(isValidLatitude).withMessage('Invalid Latitude'),
        check('longitude').exists().withMessage('Longitude is required'),//.custom(isValidLongitude).withMessage('Invalid Longitude'),
        check('location_name').exists().isLength({ min: 2, max: 256 }).withMessage('Invalid Site/Location Name'),
    ], validateBody, publicmainController.createSite);
module.exports = router;