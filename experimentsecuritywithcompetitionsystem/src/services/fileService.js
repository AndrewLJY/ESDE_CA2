//Reference: https://cloudinary.com/documentation/node_integration
const cloudinary = require('cloudinary').v2;
const config = require('../config/config');
const pool = require('../config/database')
cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    upload_preset: 'upload_to_design'
});

module.exports.uploadFile = (file, callback) => {

    // upload image here
    cloudinary.uploader.upload(file.path, { upload_preset: 'upload_to_design' })
        .then((result) => {
            //Inspect whether I can obtain the file storage id and the url from cloudinary
            //after a successful upload.

            let data = { imageURL: result.url, publicId: result.public_id, status: 'success' };
            callback(null, data);
            return;

        }).catch((error) => {

            let message = 'fail';
            callback(error, null);
            return;

        });

} //End of uploadFile

module.exports.createFileData = (imageURL, publicId, userId, designTitle, designDescription) => {
    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {

                resolve(err);
            } else {

                let query = `INSERT INTO file ( cloudinary_file_id, cloudinary_url , 
                 design_title, design_description,created_by_id ) 
                 VALUES (?,?,?,?,?) `;

                connection.query(query, [publicId, imageURL, designTitle, designDescription, userId], (err, rows) => {
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

} //End of createFileData

module.exports.getFileData = (userId, pageNumber, search) => {

    const page = pageNumber;
    if (search == null) { search = ''; };
    const limit = 4; //Due to lack of test files, I have set a 3 instead of larger number such as 10 records per page
    const offset = (page - 1) * limit;
    let designFileDataQuery = '';
    let queryArr = [];

    if ((search == '') || (search == null)) {
        queryArr = [userId, limit, offset, userId];
        designFileDataQuery = `SELECT file_id,cloudinary_url
        ,design_title,design_description FROM file  
        WHERE created_by_id=?  
        LIMIT ? OFFSET ?; 
        SET @total_records =(SELECT count(file_id) 
        FROM file WHERE created_by_id= ? )
        ;SELECT @total_records total_records; `;
    } else {
        queryArr = [userId, search, limit, offset, userId, search];
        designFileDataQuery = `SELECT file_id,cloudinary_url
        ,design_title,design_description FROM file  
        WHERE created_by_id=? AND design_title 
        LIKE concat("%",?,"%")  LIMIT ? OFFSET ?;
        SET @total_records =(SELECT count(file_id) 
        FROM file WHERE created_by_id= ? AND 
        design_title LIKE concat("%",?,"%") );
        SELECT @total_records total_records;`;
    }
    //--------------------------------------------------------------------
    //designFileDataQuery = `CALL sp_get_paged_file_records(?,?,?,?, @total_records); SELECT @total_records total_records;`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(designFileDataQuery, queryArr, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        //The following code which access the SQL return value took 2 hours of trial
                        //and error.
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getFileData

module.exports.getFileDataByUserId = (userId, pageNumber) => {

    const page = pageNumber;

    const limit = 4; //Due to lack of test files, I have set a 3 instead of larger number such as 10 records per page
    const offset = (page - 1) * limit;
    let designFileDataQuery = '';

    //Query for fetching data with page number and offset 

    designFileDataQuery = `SELECT file_id,cloudinary_url
    ,design_title,design_description 
    FROM file  WHERE created_by_id=? LIMIT ? OFFSET ?;
    SET @total_records =(SELECT count(file_id) 
    FROM file WHERE created_by_id= ? );
    SELECT @total_records total_records;`;

    return new Promise((resolve, reject) => {
        //I referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        //to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                resolve(err);
            } else {
                connection.query(designFileDataQuery, [userId, limit, offset, userId], (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        //The following code which access the SQL return value took 2 hours of trial
                        //and error.
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getFileDataByUserId