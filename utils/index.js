const bcrypt = require("bcryptjs");
const generateNewPassword = () => {
    const length = 8;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }
    return password;
}


const hashPassword = async (plainPassword) => {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

const isValidLatitude = (value) => {
    //console.log("value", value);
    const latitude = parseFloat(value);
    //console.log("value", value);
    if (isNaN(latitude)) {
        return false;
    }
    if (latitude < -90 || latitude > 90) {
        return false;
    }
    const decimalPlaces = (latitude.toString().split('.')[1] || '').length;
    //console.log("value", value, decimalPlaces>= 7);
    return decimalPlaces === 7;
};


const isValidLongitude = (value) => {
    // Longitude must be between -180 and 180 degrees
    const longitude = parseFloat(value);
    if (isNaN(longitude)) {
        return false;
    }
    if (longitude < -180 || longitude > 180) {
        return false;
    }
    const decimalPlaces = (longitude.toString().split('.')[1] || '').length;
    return decimalPlaces >= 7;
};

module.exports = {
    generateNewPassword,
    hashPassword,
    isValidLatitude,
    isValidLongitude
}
