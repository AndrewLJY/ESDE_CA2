var validator = require('validator');
// import { Auth } from 'aws-amplify';

module.exports.validateRegister = function (req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    usernamepattern = new RegExp("^[a-zA-Z0-9 ,']+$");
    passwordpattern = new RegExp("^[a-zA-Z0-9 ,']+$");


    if (usernamepattern.test(username) && passwordpattern.test(password) && validator.isEmail(email)) {
        next();
    } else {
        return res.status(400).json({
            message: 'Incorrect format'
        });
    }
    //Validation code to check register form input values
    //return response with status 400 if validation fails
}

module.exports.validateLogin = function (req, res, next) {
    var email = req.body.email;

    if (validator.isEmail(email)) {
        next();
    } else {
        return res.status(400).json({
            message: 'Incorrect format'
        });
    }
    //Validation code to check register form input values
    //return response with status 400 if validation fails
}

module.exports.sanitizeResult = function (result) {
    for (i = 0; i < result.length; i++) {
        var row = result[i];

        for (var key in row) {
            val = row[key];
            if (typeof val === "string") {
                row[key] = validator.escape(val);
            }
        }
    }
    //Sanitize each record’s values from the database result        

}

// module.exports.AWSSignUp = function (req, res, next) {
    
//     async function signUp() {
//         try {
//             var username = req.body.username;
//             var email = req.body.email;
//             var password = req.body.password;
//             usernamepattern = new RegExp("^[a-zA-Z0-9 ,']+$");
//             passwordpattern = new RegExp("^[a-zA-Z0-9 ,']+$");
            
//             if (usernamepattern.test(username) && passwordpattern.test(password) && validator.isEmail(email)) {
//                 const { user } = await Auth.signUp({
//                     username,
//                     password,
//                     attributes: {
//                         email
//                     }
//                 });
                
//                 console.log(user);
//                 next();
//             }else{
//                 return res.status(400).json({
//                     message: 'Incorrect format'
//                 });
//             }
//         } catch (error) {
//             console.log('error signing up:', error);
            
//             return res.status(400).json({
//                 message: 'error signing up:' + error
//             });
//         }
//     }
// }
