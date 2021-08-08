const config = require('../config/config');
const pool = require('../config/database');
const nodemailer = require('nodemailer');
const { mailtrapUserName, mailtrapPassword } = require('../config/config');
const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: mailtrapUserName, //generated by Mailtrap
        pass: mailtrapPassword //generated by Mailtrap
    }
});

module.exports.createUser = (fullname, email, password, callback) => {
    userDataQuery = `INSERT INTO user ( fullname, email, user_password, 
        role_id) VALUES (?,?,?,2) `;

    pool.getConnection((err, connection) => {
        if (err) {
            callback(null, err);
        } else {
            connection.query(userDataQuery, [fullname, email, password], (err, rows) => {
                if (err) {
                    callback(null, err);
                } else {
                    callback(rows, null);
                }
                connection.release();
            });
        }
    });


} // End of createUser

module.exports.updateUser = (recordId, newRoleId) => {

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)

        userDataQuery = `UPDATE user SET role_id =? WHERE user_id=?`;

        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(userDataQuery, [newRoleId, recordId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of updateUser

module.exports.getUserData = (pageNumber, search) => {
    const page = pageNumber;
    if (search == null) { search = ''; };
    const limit = 4; //Due to lack of test files, I have set a 3 instead of larger number such as 10 records per page
    const offset = (page - 1) * limit;
    let queryArr = [];
    //-------------- Code which does not use stored procedure -----------
    //Query for fetching data with page number, search text and offset value

    if ((search == '') || (search == null)) {
        queryArr = [limit, offset];
        userDataQuery = `SELECT user_id, fullname, email, role_name 
        FROM user INNER JOIN role ON user.role_id = role.role_id 
        LIMIT ? OFFSET ?; SET @total_records =(SELECT count(user_id) FROM user);
        SELECT @total_records total_records; `;
    } else {
        queryArr = [search, limit, offset, search];
        userDataQuery = `SELECT user_id, fullname, email, role_name 
        FROM user INNER JOIN role ON user.role_id = role.role_id 
        AND fullname LIKE concat("%",?,"%")  LIMIT ? OFFSET ?;
        SET @total_records =(SELECT count(user_id) 
        FROM user WHERE fullname LIKE concat("%",?,"%") );
        SELECT @total_records total_records;`;
    }

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {

                connection.query(userDataQuery, queryArr, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getUserData

module.exports.getOneUserData = function (recordId) {
    userDataQuery = `SELECT user_id, fullname, email, 
    user.role_id, role_name FROM user INNER JOIN role 
    ON user.role_id = role.role_id WHERE user_id=?`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(userDataQuery, [recordId], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getOneUserData

module.exports.getOneUserDataByEmail = function (search) {
    userDataQuery = `SELECT user_id, fullname, email, 
    user.role_id, role_name FROM user INNER JOIN role 
    ON user.role_id = role.role_id WHERE email=?`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(userDataQuery, [search], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getOneUserDataByEmail

// =========================================================================================================================================
module.exports.getOneDesignData = function (recordId) {
    // userDataQuery = `SELECT file_id,cloudinary_file_id,cloudinary_url,design_title,design_description 
    //     FROM file WHERE file_id=?`;
    userDataQuery = `SELECT * FROM file WHERE file_id=?`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(userDataQuery, [recordId], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getOneDesignData

// =========================================================================================================================================

module.exports.updateDesign = (recordId, title, description) => {
    userDataQuery = `UPDATE file SET design_title =?, 
                    design_description=? WHERE file_id=?`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(userDataQuery, [title, description, recordId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of updateDesign

module.exports.createOneEmailInvitation = (userData, recipientName, recipientEmail) => {

    return new Promise((resolve, reject) => {


        // send mail with defined transport object
        try {
            let info = transporter.sendMail({
                from: `${userData.fullname}<${userData.email}>`, // sender address
                to: recipientEmail, // list of receivers
                subject: "Hello from Bee competition system admin", // Subject line
                text: `Hi ${recipientName} You have been invited by your friend, ${userData.fullname} to participate in a competition at http://localhost:3001`, // plain text body
                html: `Hi ${recipientName} You have been invited by your friend, ${userData.fullname} to participate in a competition at http://localhost:3001`, // html body
            });
            resolve({ status: 'success', description: 'Email sent' });
        } catch (error) {
            reject({ status: 'fail', description: error });
        }
    }); //End of new Promise object creation
} //End of createOneEmailInvitation
