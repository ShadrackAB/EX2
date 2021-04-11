const express = require('express');
const authController = require('../controllers/auth');
const Nexmo = require('nexmo');
const dotenv = require('dotenv');

const router = express.Router();

// Import env configuration file...
dotenv.config({ path: './.env'});

/***
 * Imports the Nexmo API kEY
 * and secret stored in .env file...
 ***/
const nexmo = new Nexmo({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET
})

// Route to display register page...
router.get('/register', (req, res) => {
  res.render('register');
});

// Route to display login page...
router.get('/login', (req, res) => {
  res.render('login');
});

/***Creates a route to the 2FA PAGE.
 * The 2FA PAGE displays a HTML form
 * for collecting user input such as Mobile Number...

router.get('/2fa', authController.isLoggedIn, (req, res) => {
  res.render('2fa', { 
    user: req.user,
    message: '2FA PAGE'
  });
});

/***This route the verifies user input
 * with the Nexmo API which checks if
 * the Mobile Number is validate and
 * returns an error if number is not 
 * valid...

router.post('/verify', (req, res) => {
  nexmo.verify.request({
    number: req.body.number,
    brand: 'ECORP'
  }, (error, result) => {

    if(result.status != 0) {
      res.render('2fa', { message: result.error_text })
    } else {
      res.render('check', { requestId: result.request_id})
    }
 })
})

/***
 * This route checks 2FA code from Nexmo
 * API is correct if not displays an error
 * message to user if correct authenticate
 * and redirects to the HOME PAGE...

router.post('/check', (req, res) => {
  nexmo.verify.check({
    request_id: req.body.requestId,
    code: req.body.code
  }, (error, result) => {
    if(result.status != 0) {
      res.render('2fa', {message: result.error_text})
    } else {
      res.redirect('/')
    }
  })
})
***/


// Route to display HOME PAGE...
router.get('/', authController.isLoggedIn, (req, res) => {
  res.render('index', {user: req.user});
});

// Route to display PROFILE PAGE...
router.get('/profile', authController.isLoggedIn, (req, res) => {
  console.log(req.user);
  if( req.user ) {
    res.render('profile', {
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
  
})

module.exports = router;