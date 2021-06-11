const setUpDb = require('./db/db-setup');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const ejs = require("ejs");
const cookieParser = require('cookie-parser');

const User = require('./db/models/users');
const Expense = require('./db/models/expenses');
const Helper = require('./middleware/helpers');
const {verify} = require('./middleware/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ credentials: true }));
app.use(verify);
app.use(cors());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

setUpDb();

const {
    getHome,
    getSignIn,
    getSignUp,
    postSignIn,
    postSignUp,
    signOut,
    error,
} = require('./controllers/users');

const {
    getUserHome,
    postUserHome,
    getMyExpenses,
} = require('./controllers/expenses');

app.route('/')
    .get(getHome);

app.route('/signin')
    .get(getSignIn)
    .post(postSignIn);

app.route('/signup')
    .get(getSignUp)
    .post(postSignUp)

app.route('/userHome')
    .get(getUserHome)
    .post(postUserHome);

app.route('/myExpenses')
    .get(getMyExpenses);

app.route('/signout')
    .get(signOut);

app.route('/error')
    .get(error);

const PORT = process.env.PORT || 8080;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);



 