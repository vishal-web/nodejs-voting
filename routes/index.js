const express = require('express');
const router = express.Router();

const auth_controller = require('../controllers/authController');
const dashboard_controller = require('../controllers/dashboardController');
const user_controller = require('../controllers/userController');


router.get('/', auth_controller.signup);
router.get('/signup', auth_controller.signup);
router.get('/login', auth_controller.login);
router.get('/dashboard', dashboard_controller.dashboard);

router.post('/api/signup', auth_controller.create);
router.post('/api/login', auth_controller.login_user);

router.get('/api/users', dashboard_controller.users);
router.get('/api/users', dashboard_controller.users);
router.get('/api/logout', dashboard_controller.logout);
router.post('/api/vote', dashboard_controller.vote);


module.exports = router;