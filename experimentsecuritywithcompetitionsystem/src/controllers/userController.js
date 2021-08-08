//-----------------------------------
// Imports
//----------------------------------

const userManager = require('../services/userService');
const fileDataManager = require('../services/fileService');
const config = require('../config/config');
const validate = require('../validation/validationFn.js')
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

exports.processDesignSubmission = (req, res, next) => {
    let designTitle = req.body.designTitle;
    let designDescription = req.body.designDescription;
    let userId = req.body.userId;
    let userRole = req.body.userRole;
    let file = req.body.file;
    titledescpattern = new RegExp("^[a-zA-Z0-9 ,']+$");
    let file_name = req.body.file_name;

    //file type verification
    var approved = false;
    var validFileExtensions = ["jpg", "jpeg", "png"];
    var type = file_name.slice(file_name.indexOf(".") + 1);
    for (var i = 0; i < validFileExtensions.length; i++) {
        if (type == validFileExtensions[i] || type == validFileExtensions[i].toUpperCase()) {
            approved = true;
        }
    }

    if (approved == false) {
        let message = 'Invalid file type.';
        LogData(req.ip, 415, "File (" + file_name + ") has been rejected for being an invalid file type from user:" + userId, next);
        res.status(415).json({ message: message });
    }
    else if (titledescpattern.test(designTitle) && titledescpattern.test(designDescription)) {
        fileDataManager.uploadFile(file, async function (error, result) {
            let uploadResult = result;
            if (error) {
                let message = 'Unable to complete file submission.';
                LogData(req.ip, 500, "Unknown error, failed file submission (" + file_name + ") for user: " + userId, next);
                res.status(500).json({ message: message });
                res.end();
            } else {
                if (req.extractedID == userId && req.extractedRole == userRole) {
                    //Update the file table inside the MySQL when the file image
                    //has been saved at the cloud storage (Cloudinary)
                    let imageURL = uploadResult.imageURL;
                    let publicId = uploadResult.publicId;
                    try {
                        let result = await fileDataManager.createFileData(imageURL, publicId, userId, designTitle, designDescription);
                        if (result) {
                            let message = 'File submission completed.';
                            LogData(req.ip, 200, "File (" + file_name + ") has been submitted by user: " + userId, next);
                            res.status(200).json({ message: message, imageURL: imageURL });
                        }
                    } catch (error) {
                        let message = 'File submission failed.';
                        LogData(req.ip, 500, "Unknown error, failed file submission (" + file_name + ") for user: " + userId, next);
                        res.status(500).json({
                            message: message
                        });
                    }
                } else {
                    LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
                    return res.status(403).json({
                        message: 'Unauthorized Access',
                        userid: req.extractedID,
                        userrole: req.extractedRole
                    });
                }
            }
        })
    } else {
        let message = 'Invalid design title and description.';
        LogData(req.ip, 500, "failed file submission (" + file_name + ") for user: " + userId + " due to invalid design title (" + designTitle +
            ") or invalid description (" + designDescription + ") ", next);
        res.status(500).json({
            message: message
        });
    }
}; //End of processDesignSubmission

exports.processGetSubmissionData = async (req, res, next) => {
    let pageNumber = req.params.pagenumber;
    let search = req.params.search;
    let userId = req.body.userId;
    let userRole = req.body.userRole;

    if (req.extractedID == userId && req.extractedRole == userRole) {
        try {
            let results = await fileDataManager.getFileData(userId, pageNumber, search);

            if (results) {
                var jsonResult = {
                    'number_of_records': results[0].length,
                    'page_number': pageNumber,
                    'filedata': results[0],
                    'total_number_of_records': results[2][0].total_records
                }
                validate.sanitizeResult(jsonResult)
                LogData(req.ip, 200, "Submission Data requested", next);
                return res.status(200).json(jsonResult);
            }

        } catch (error) {
            let message = 'Server is unable to process your request.';
            LogData(req.ip, 500, "Failed to process submission data", next);
            return res.status(500).json({
                message: error
            });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: 'Unauthorized Access',
            userid: req.extractedID,
            userrole: req.extractedRole
        });
    }
}; //End of processGetSubmissionData

exports.processGetSubmissionsbyEmail = async (req, res, next) => {
    let pageNumber = req.params.pagenumber;
    let search = req.params.search;
    search = encryptData(search);
    let userId = req.body.userId;
    let userRole = req.body.userRole;

    if (req.extractedID == userId && req.extractedRole == userRole) {

        try {
            //Need to search and get the id information from the database
            //first. The getOneuserData method accepts the userId to do the search.
            let userData = await userManager.getOneUserDataByEmail(search);
            if (userData) {
                let results = await fileDataManager.getFileDataByUserId(userData[0].user_id, pageNumber);
                if (results) {
                    var jsonResult = {
                        'number_of_records': results[0].length,
                        'page_number': pageNumber,
                        'filedata': results[0],
                        'total_number_of_records': results[2][0].total_records
                    }
                    validate.sanitizeResult(jsonResult);
                    LogData(req.ip, 200, "User: " + userId + " attained submissions via email", next);
                    return res.status(200).json(jsonResult);
                }//Check if there is any submission record found inside the file table
            }//Check if there is any matching user record after searching by email


        } catch (error) {
            let message = 'Server is unable to process your request.';
            LogData(req.ip, 500, "Failed to attain submission via email", next);
            return res.status(500).json({
                message: error
            });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: 'Unauthorized Access',
            userid: req.extractedID,
            userrole: req.extractedRole
        });
    }

}; //End of processGetSubmissionsbyEmail

exports.processGetUserData = async (req, res, next) => {
    let pageNumber = req.params.pagenumber;
    let search = req.params.search;
    let userId = req.body.userId;
    let userRole = req.body.userRole;

    if (req.extractedID == userId && req.extractedRole == userRole) {
        try {
            let results = await userManager.getUserData(pageNumber, search);
            //results[0].email = decryptData(results[0].email);

            for (var i  = 0; i < results[0].length; i++) {
                results[0][i].email = decryptData(results[0][i].email);
            }

            if (results) {
                var jsonResult = {
                    'number_of_records': results[0].length,
                    'page_number': pageNumber,
                    'userdata': results[0],
                    'total_number_of_records': results[2][0].total_records
                }
                validate.sanitizeResult(jsonResult);
                LogData(req.ip, 200, "User data processed", next);
                return res.status(200).json(jsonResult);
            }

        } catch (error) {
            let message = 'Server is unable to process your request.';
            LogData(req.ip, 500, "Failed to GET user data", next);
            return res.status(500).json({
                message: error
            });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: 'Unauthorized Access',
            userid: req.extractedID,
            userrole: req.extractedRole
        });
    }

}; //End of processGetUserData

exports.processGetOneUserData = async (req, res, next) => {
    let recordId = req.params.recordId;
    let userId = req.body.userId;
    let userRole = req.body.userRole;

    if (req.extractedID == userId && req.extractedRole == userRole) {
        try {
            let results = await userManager.getOneUserData(recordId);
            results[0].email = decryptData(results[0].email);


            if (results) {
                if (results[0].role_name == "admin") {
                    var jsonResult = {
                        'userdata': results[0],
                        role: "admin"
                    }
                    LogData(req.ip, 200, "GET user data of user: " + recordId, next);
                    return res.status(200).json(jsonResult);
                } else {
                    var jsonResult = {
                        'userdata': results[0],
                        role: "user"
                    }
                    LogData(req.ip, 200, "GET user data of admin: " + recordId, next);
                    return res.status(200).json(jsonResult);
                }
            }

        } catch (error) {
            let message = 'Server is unable to process your request.';
            LogData(req.ip, 500, "Unable to GET data for user: " + recordId, next);
            return res.status(500).json({
                message: error
            });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: 'Unauthorized Access',
            userid: req.extractedID,
            userrole: req.extractedRole
        });
    }

}; //End of processGetOneUserData

exports.processUpdateOneUser = async (req, res, next) => {
    //Collect data from the request body 
    let recordId = req.body.recordId;
    let newRoleId = req.body.roleId;
    let userId = req.body.userId;
    let userRole = req.body.userRole;
    if (req.extractedID == userId && req.extractedRole == userRole) {
        try {
            results = await userManager.updateUser(recordId, newRoleId);
            LogData(req.ip, 200, "Successful update for user: " + recordId, next);
            return res.status(200).json({ message: 'Completed update' });

        } catch (error) {

            LogData(req.ip, 500, "Failed to update data for user: " + recordId, next);
            return res.status(500).json({ message: 'Unable to complete update operation' });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: 'Unauthorized Access',
            userid: req.extractedID,
            userrole: req.extractedRole
        });
    }


}; //End of processUpdateOneUser

exports.processGetOneDesignData = async (req, res, next) => {
    let recordId = req.params.fileId;

    try {

        let results = await userManager.getOneDesignData(recordId);
        if (req.extractedID == results[0].created_by_id) {
            if (results) {
                var jsonResult = {
                    'filedata': results[0],
                }
                LogData(req.ip, 200, "Attained design data of id: " + recordId, next);
                return res.status(200).json(jsonResult);

            }
        } else {
            LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
            return res.status(403).json({
                message: "Unauthorized Access",
                userid: req.extractedID
            });
        }
    } catch (error) {
        let message = 'Server is unable to process the request.';
        LogData(req.ip, 500, "Unable to GET design data of id: " + recordId, next);
        return res.status(500).json({
            message: error
        });
    }

}; //End of processGetOneDesignData

exports.processSendInvitation = async (req, res, next) => {

    let userRole = req.body.userRole;
    let userId = req.body.userId;
    let recipientEmail = req.body.recipientEmail;
    let recipientName = req.body.recipientName;

    if (req.extractedID == userId && req.extractedRole == userRole) {
        try {
            //Need to search and get the user's email information from the database
            //first. The getOneuserData method accepts the userId to do the search.
            let userData = await userManager.getOneUserData(userId);
            let results = await userManager.createOneEmailInvitation(userData[0], recipientName, recipientEmail);
            if (results) {
                var jsonResult = {
                    result: 'Email invitation has been sent to ' + recipientEmail + ' ',
                }
                validate.sanitizeResult(jsonResult);
                LogData(req.ip, 200, "Email invitation has been sent to " + recipientEmail + " ", next);
                return res.status(200).json(jsonResult);
            }
        } catch (error) {
            let message = 'Server is unable to process the request.';
            LogData(req.ip, 500, "Unable to send email invitation to " + recipientEmail + " ", next);
            return res.status(500).json({
                message: message,
                error: error
            });
        }
    } else {
        LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
        return res.status(403).json({
            message: "Unauthorized Access",
            userid: req.extractedID
        });
    }

}; //End of processSendInvitation

exports.processUpdateOneDesign = async (req, res, next) => {
    //Collect data from the request body 
    let fileId = req.body.fileId;
    let designTitle = req.body.designTitle;
    let designDescription = req.body.designDescription;
    let userId = req.body.userId;
    let userRole = req.body.userRole;
    titledescpattern = new RegExp("^[a-zA-Z0-9 ,']+$");

    if (titledescpattern.test(designTitle) && titledescpattern.test(designDescription)) {
        if (req.extractedID == userId && req.extractedRole == userRole) {
            try {

                results = await userManager.updateDesign(fileId, designTitle, designDescription);
                LogData(req.ip, 200, "File: " + fileId + " has been updated", next);
                return res.status(200).json({ message: 'Completed update' });

            } catch (error) {

                LogData(req.ip, 500, "Failed to update File: " + fileId, next);
                return res.status(500).json({ message: 'Unable to complete update operation' });
            }
        } else {
            LogData(req.ip, 403, "Unauthorized Access attempt by user: " + req.extractedID, next);
            return res.status(403).json({
                message: 'Unauthorized Access',
                userid: req.extractedID,
                userrole: req.extractedRole
            });
        }
    } else {
        let message = 'Invalid design title and description.';
        LogData(req.ip, 500, "failed file submission (" + file_name + ") for user: " + userId + " due to invalid design title (" + designTitle +
            ") or invalid description (" + designDescription + ") ", next);

        res.status(500).json({
            message: message
        });
    }


}; //End of processUpdateOneDesign