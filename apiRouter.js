// IMPORTS // 
var express = require ('express');
var usersCtrl = require ('./Routes/usersCtrl');



// ROUTES //
exports.router = (() => {
    var apiRouter = express.Router();

    // USER ROUTE // 
    apiRouter.route('/users/register/').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);

    return apiRouter;
})();