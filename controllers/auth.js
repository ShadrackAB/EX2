//const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const db = require('../database');


// allows user to login to the application...
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if( !username || !password) {
      return res.status(400).render('login', {
        message: 'Please provide both username and password'
      })
    }
    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
      console.log(results);
    if( results.length < 1 ) {
        return res.status(401).render('login', {
          message: 'Login Failed! Bad Credentials'
        });
      }
      else if(!(await bcrypt.compare(password, results[0].password))) {
        return res.status(401).render('login', {
          message: 'Login Failed! Bad Credentials'
        });
      }
      else {
        const id = results[0].id;
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });
        console.log("The token is: " + token);
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }
        res.cookie('jwt', token, cookieOptions );
        //res.status(200).redirect("/2fa");
        res.status(200).redirect("/");
      }
    })
  } catch (error) {
    console.log(error);
  }
}

// Allows new users to register to the application...
exports.register = (req, res) => {
  console.log(req.body);
  const { fname, lname, username, mobile, email, password, passwordConfirm } = req.body;

  // uses an SQL prepared statement and placeholder to query database...
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error);
    }
    if( results.length > 0 ) {
      return res.render('register', {
        message: 'That email is already in use'
      })
    } else if( password !== passwordConfirm ) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }
    // Hashes user password by using bcrypt with strength 8...
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

    db.query('INSERT INTO users SET ?', {fname:fname, lname:lname, mobile:mobile, username:username, email:email, password:hashedPassword }, (error, results) => {
      if(error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render('register', {
          message: 'User registered'
        });
      }
    })
  });
}


exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if( req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      process.env.JWT_SECRET
      );
      console.log(decoded);
      //2) Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result);
        if(!result) {
          return next();
        }
        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();
      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
}

exports.logout = async (req, res) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true,
    
  });

  res.status(200).redirect('/');
}

/*** 
exports.covers = (req, res) => {
  console.log(req.body);
  const { coverName, longitudes, latitudes, postcode, IPaddress} = req.body;

  if( !coverName || !longitudes || !latitudes || !postcode || IPaddress ) {
    return res.status(400).render('covers', {
      message: 'Please provide cover INFORMATION!!'
    })
  }
  // uses an SQL prepared statement and placeholder to query database...
  db.query('SELECT coverName FROM manholecovers WHERE coverName = ?', [coverName, IPaddress], async (error, results) => {
    if(error) {
      console.log(error);
    }
    else if( results.length > 0) {
      return res.render('covers', {
        message: 'Cover Already exsists! Try Again'
      })
    } 
    db.query('INSERT INTO manholecovers SET ?', {coverName:coverName, longitudes:longitudes, latitudes:latitudes, postcode:postcode, IPaddress:IPaddress }, (error, results) => {
      if(error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render('covers', {
          message: 'cover registered'
        });
      }
    })
  });
}
***/
