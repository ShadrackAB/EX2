const express = require("express");
const path = require('path');
//const mysql = require("mysql");
//const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
//const db = require('./database');


//dotenv.config({ path: './.env'});

const app = express();

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');


//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log("Server started on Port 5000");
})