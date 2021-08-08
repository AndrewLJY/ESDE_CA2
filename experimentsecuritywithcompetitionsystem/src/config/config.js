//config.js
const dotenv = require('dotenv');
dotenv.config(); //Build the process.env object.
module.exports = {
    databaseUserName: process.env.DB_USERNAME,
    databasePassword: process.env.DB_PASSWORD,
    databaseName: process.env.DB_DATABASE_NAME,

    cloudinaryUrl: process.env.CLOUDINARY_URL,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
    JWTKey: process.env.JWTKEY,

    mailtrapUserName: process.env.MAILTRAP_USERNAME,
    mailtrapPassword:process.env.MAILTRAP_PASSWORD,
    
    
};

// window.config = {
//     databaseUserName: process.env.DB_USERNAME,
//     databasePassword: process.env.DB_PASSWORD,
//     databaseName: process.env.DB_DATABASE_NAME,

//     cloudinaryUrl: process.env.CLOUDINARY_URL,
//     cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
//     cloudinaryApiKey: "",
//     cloudinaryApiSecret: "",
//     JWTKey: process.env.JWTKEY,

//     mailtrapUserName: process.env.MAILTRAP_USERNAME,
//     mailtrapPassword:process.env.MAILTRAP_PASSWORD,
    
//     cognito: {
//         userPoolId: 'us-east-1_WdPeaSoCy',
//         userPoolClientId: '133j9u4tisaii5bo4fh08q0ceb',
//         region: 'us-east-1'
//     },
//     api: {
//         invokeUrl: 'http://ec2-52-22-178-234.compute-1.amazonaws.com:5000/api/user/register',
//     }
// }
//Reference:
//https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786