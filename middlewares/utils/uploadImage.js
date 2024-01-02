const multer = require('multer');
const { env } = process;

const pathArray = __dirname.split('/');
pathArray.pop();
pathArray.pop();
pathArray.pop();
const profileImgFolder = pathArray.join('/') + "/Images/UsersProfileImage/";
//console.log(profileImgFolder);

// Define storage for uploaded images
const setStorage = (path) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Set the destination folder where you want to save the images
            cb(null, path);
        },
        filename: function (req, file, cb) {
            // Define the file name for the uploaded image (you can customize this as needed)
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
    const upload = multer({ storage: storage });
    return upload;
}


// Create the multer instance


// Middleware function to handle file upload
const uploadProfileImage = (req, res, next) => {
    const upload = setStorage(profileImgFolder);
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file too large)
            return res.status(400).json({ status: env.s400, msg: 'File upload error' });
        } else if (err) {
            // An unknown error occurred
            return res.status(500).json({ status: env.s500, msg: 'Server error' });
        }
        next();
    });
}

module.exports = {
    uploadProfileImage
};