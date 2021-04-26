// IMPORTS // 
var express = require ('express');
var usersCtrl = require ('./Routes/usersCtrl');



// ROUTES //
exports.router = (() => {
    var apiRouter = express.Router();

    // USER ROUTE // 
    apiRouter.route('/users').post(usersCtrl.register);
    apiRouter.route('/users/login/').post(usersCtrl.login);
    apiRouter.route('/users/me/:id').get(usersCtrl.getUserProfile);
    apiRouter.route('/users/all/').get(usersCtrl.getAllUserProfile);
    apiRouter.route('/users/update/:id').put(usersCtrl.updateUserProfile);
    apiRouter.route('/users/delete/:id').delete(usersCtrl.deleteUser);

    return apiRouter;
})();