require('dotenv').config();
const cron = require('node-cron');
const logger = require('./config/app_logger');
const connectDB = require('./config/db_connection');
const express = require('express');
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.disable('x-powered-by'); // less hackers know about our stack
//app.use(cookieParser);

// import middlewares
const { verifyUser, verifyEmployee, verifyAdmin, verifySuperAdmin } = require("./middlewares/auth/index");
const { notifyPunchInUsers } = require("./cron/index");

// import routes
const authRoute = require("./routes/auth");
const publicRoute = require("./routes/public");
const superadminRoute = require("./routes/superadmin");
const adminRoute = require("./routes/admin");
const employeeRoute = require("./routes/employee");

app.use('/ats/api/auth', authRoute);
app.use('/ats/api/public', verifyUser, publicRoute);
app.use('/ats/api/superadmin', verifySuperAdmin, superadminRoute);
app.use('/ats/api/admin', verifyAdmin, adminRoute);
app.use('/ats/api/employee', verifyEmployee, employeeRoute);



// Schedule at the beginning of every hour 
cron.schedule('00 * * * *', () => {
    notifyPunchInUsers();
});

// cron.schedule('* * * * * *', () => {
//     notifyPunchInUsers();
// });




const port = 3002 //process.env.eas1_backend_Port;
/** start server only when we have valid connection */
connectDB().authenticate().then(() => {
    try {
        app.listen(port, () => {
            logger.info(`Server connected to ----> ${port} Port`);
        })
    } catch (error) {
        logger.error(`Cannot connect to the server causing error ${error}`)
    }
}).catch(error => {
    logger.error(`Invalid database connection...! causing error ${error}`);
})
