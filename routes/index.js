const Router = require('express').Router();

const SignupRoutes = require('./signup.js');
const SigninRoutes = require('./signin.js');
const Signup2FARoutes = require('./signup2FA');


Router.use('/', SignupRoutes);
Router.use('/', SigninRoutes);
Router.use('/', Signup2FARoutes);


module.exports = Router;
