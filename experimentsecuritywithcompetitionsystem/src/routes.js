// Import controlers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const checkUserFn = require('./middlewares/checkUserFn');
const checkUserFnSolution = require('./middlewares/checkUserFnSolution');
const checkUserFrontEnd = require('./middlewares/checkUserFrontEnd');
const validate = require('./validation/validationFn');
//const log = require('./middlewares/logData');

// Match URL's with controllers
exports.appRoute = router => {

    // login
    router.post('/api/user/login', validate.validateLogin, authController.processLogin);

    // register
    router.post('/api/user/register', validate.validateRegister ,authController.processRegister);

    // submit submission
    router.post('/api/user/process-submission', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processDesignSubmission);

    // update user data
    router.put('/api/user/', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processUpdateOneUser);

    // update submission data
    router.put('/api/user/design/', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processUpdateOneDesign);

    // send invitation
    router.post('/api/user/processInvitation/', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processSendInvitation);

    // front authenthication
    router.post('/api/user/frontauthenticate', checkUserFnSolution.checkForValidUserRoleUser, checkUserFrontEnd.checkInFront);

    // get submission
    router.get('/api/user/process-search-design/:pagenumber/:search?', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetSubmissionData);

    // get users
    router.get('/api/user/process-search-user/:pagenumber/:search?', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetUserData);

    // get submission by email
    router.get('/api/user/process-search-user-design/:pagenumber/:search?', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetSubmissionsbyEmail);

    // get one user data
    router.get('/api/user/:recordId', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetOneUserData);

    // get one design data
    router.get('/api/user/design/:fileId', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetOneDesignData);

    // get role from user ID
    router.get('/api/user/getuserRolefromUserID/:recordId', checkUserFnSolution.checkForValidUserRoleUser, checkUserFn.getClientUserId, userController.processGetOneUserData);

};