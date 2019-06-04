const express = require('express');
const router = express.Router();
const fs = require('fs');
const config = require('../config.js');
const jwt = require('jsonwebtoken');

const auth_controller = require('../controllers/authController');
const dashboard_controller = require('../controllers/dashboardController');
const user_controller = require('../controllers/userController');

const fileLogger = 'logger.txt';
const loggerPath = '../' + fileLogger;

const routerLoggerMiddleware = (req, res, next) => {

	let message = 'Router Logged host ' + req.headers.host + ' path ' + req.originalUrl + ' -- ' + new Date + '\n';


	fs.exists('logger.txt', (exists) => {
		if (exists) {
			fs.appendFile(fileLogger, message, (err) => {
				if (err) throw err; 
			});
		} else {
			fs.writeFile(fileLogger, message, (err) => {
				if (err) throw err; 
			});
		}
	})

	next();
}

const specialLogger = (req, res, next) => {
	console.log('Special Logger For Signup');
	next();
}

const checkToken = (req, res, next) => {
	const token = req.query.token || req.headers['x-access-token'] || req.body.token;
	let  response = null;

	res.set('Content-Type','application/json');
	if (token) {
		
		jwt.verify(token, config.secret, (err, decoded) => {
			if (err) {
				response = { status : 'error'};

				switch(JSON.parse(JSON.stringify(err)).name) {
					case 'TokenExpiredError' : response.message = 'Token expired';
						break;
					default : response.message = 'Invalid Token Supplied';
						break;
				}
				res.end(JSON.stringify(response));
			} else {
				response = {
					status : 'success',
					decoded : decoded
				}
				next();	
			}
		})
	} else {
		response = {
			status : 'error',
			message : 'Token is not provided'
		} 
		res.end(JSON.stringify(response));
	}
}


router.use(routerLoggerMiddleware);


router.get('/', auth_controller.signup);
router.get('/signup', specialLogger , auth_controller.signup);
router.get('/login', auth_controller.login);
router.get('/dashboard', dashboard_controller.dashboard);

router.post('/api/signup', auth_controller.create);
router.post('/api/login', auth_controller.login_user);

router.get('/api/users', checkToken, dashboard_controller.users); 
router.get('/api/logout', checkToken, dashboard_controller.logout);
router.post('/api/vote', checkToken, dashboard_controller.vote);

 	
router.use('/product', require('./productRoutes').router);

module.exports = router;