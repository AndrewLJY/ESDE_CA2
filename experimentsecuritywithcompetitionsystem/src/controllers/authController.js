//-----------------------------------
// Imports
//----------------------------------

const user = require('../services/userService');
const auth = require('../services/authService');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const validateFn = require('../validation/validationFn.js');
var fs = require("fs");

//-----------------------------------
// Middleware functions
//----------------------------------

function LogData(ip, response, message, next) {
    var logEntry = "";
    //get date + time
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    logEntry += '[' + date + ' ' + time + '] Response code: ' + response + ' Message: ' + message + ' ---end {' + ip + '}\n';

    console.log(logEntry);

    fs.appendFile("server_log.txt", logEntry, function (writer) { //edits stats file
    });

    next();
}

function encryptData(data) {
    data = data.replace("@", "$");

    var arr = [];
    for (var i = 0, l = data.length; i < l; i++) {
        var hex = Number(data.charCodeAt(i)).toString(16);
        arr.push(hex);
    }

    arr = arr.reverse();
    return arr.join('');
}

function decryptData(data) {

    var hex = data.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    str = str.replace("$", "@");
    str = str.split("").reverse();

    return str.join("");
}

//-----------------------------------
// Endpoints
//----------------------------------

exports.processLogin = (req, res, next) => {

    let email = req.body.email;
    email = encryptData(email);
    let password = req.body.password;
    try {
        auth.authenticate(email, function (error, results) {
            if (error) {
                let message = 'Credentials are not valid.';

                LogData(req.ip, 500, "Invalid credentials on login attempt", next);
                return res.status(500).json({ message: error });

            } else {
                if (results.length == 1) {
                    if ((password == null) || (results[0] == null)) {
                        LogData(req.ip, 500, "Blank credentials on login attempt", next);
                        return res.status(500).json({ message: 'login failed' });
                    }
                    if (bcrypt.compareSync(password, results[0].user_password) == true) {

                        let data = {
                            user_id: results[0].user_id,
                            role_name: results[0].role_name,
                            token: jwt.sign({ id: results[0].user_id, role: results[0].role_name }, config.JWTKey, {
                                expiresIn: 86400 //Expires in 24 hrs
                            })
                        }; //End of data variable setup

                        LogData(req.ip, 200, "Succesful login attempt into account: " + decryptData(email), next);
                        return res.status(200).json(data);
                    } else {

                        LogData(req.ip, 500, "Invalid password, failed login attempt into account: " + decryptData(email), next);
                        return res.status(500).json({ message: error });
                    } //End of passowrd comparison with the retrieved decoded password.
                } //End of checking if there are returned SQL results

            }

        })

    } catch (error) {
        LogData(req.ip, 500, "Login Service provider failed", next);
        return res.status(500).json({ message: error });
    } //end of try



};

exports.processRegister = (req, res, next) => {
    let fullName = req.body.fullName;
    let email = req.body.email;
    email = encryptData(email);
    let password = req.body.password;


    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            LogData(req.ip, 500, "Error on hashing password for registration", next);
            return res.status(500).json({ statusMessage: 'Unable to complete registration' });
        } else {

            results = user.createUser(fullName, email, hash, function (results, error) {
                if (results != null) {

                    LogData(req.ip, 200, "Completed registration for new account: " + decryptData(email), next);
                    return res.status(200).json({ statusMessage: 'Completed registration.' });
                }
                if (error) {            
                    LogData(req.ip, 500, "Failed to complete registration for account: " + decryptData(email), next);
                    return res.status(500).json({ statusMessage: 'Unable to complete registration' });
                }
            });//End of anonymous callback function


        }
    });


}; // End of processRegister