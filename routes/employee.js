const express = require('express');
const router = express.Router();
const {check} = require('express-validator');
// import middlewares
const validateBody = require("../middlewares/express_validator/validateBody");
// import controller
const employeemainController = require("../controllers/employee/index");


// routes site_location_id,location_distance_bykm
router.post('/punchIn',
[
    check('site_location_id').exists().isNumeric().withMessage('Invalid site_location_id'),
    check('location_distance_bykm').exists().isNumeric().withMessage('Invalid location_distance_bykm'),
],validateBody,employeemainController.checkIn
);
router.post('/punchOut',
employeemainController.checkOut
);
router.get('/emplasttenAttendanceRecord',
employeemainController.getEmpLastTenAttendanceRecord
);


module.exports = router;
