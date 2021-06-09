const setUpDb = require('./db/db-setup');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const ejs = require("ejs");
const cookieParser = require('cookie-parser');

const User = require('./db/models/users');
const Expense = require('./db/models/expenses')
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

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

setUpDb();

app.get('/', async (req, res) => {
    try {
        res.render('index');
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

app.get('/signup', async (req, res) => {
    try {
        res.render('signup')
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

app.post('/signup', async (req, res) => {
    try {
        const {name, email, password} = req.body;
        console.log(name, email, password);
        if (!email || !password) {
            return res.status(400).send({'message': 'Some values are missing'});
          }
          if (!Helper.isValidEmail(email)) {
            return res.status(400).send({ 'message': 'Please enter a valid email address' });
          }
          const hashPassword = Helper.hashPassword(password);
          const userExists = await User.query().where('email', '=', email);
          if(userExists.length==0) {
              const user = await User.query().insert({
                  name: name,
                  email: email,
                  password: hashPassword,
              });
              if(user) {
                const token = Helper.generateToken(user.id);
                res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                return res.redirect('/userHome');
              } else {
                return res.status(400).send({ 'message': 'Some err occured' })
              }
          } else {
            return res.status(400).send({ 'message': 'User with that EMAIL already exist' })
          }
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

app.get('/signin', async (req, res) => {
    try {
        res.render('signin')
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

app.post('/signin', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send({'message': 'Some values are missing'});
        }
        const userExists = await User.query().where('email', '=', email);
        if(userExists.length == 1) {
            if(Helper.comparePassword(userExists[0].password, password)) {
                const token = Helper.generateToken(userExists[0].id);
                console.log('Signed In');
                res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                res.redirect('/userHome');
            } else {
                return res.status(400).send({ 'message': 'Incorrect Credentials' }) 
            }
        } else {
            return res.status(400).send({ 'message': 'No user with that EMAIL exists' })
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    }  
});

app.get('/userHome', async (req, res) => {
    try {
        if(req.cookies) {
            const token = req.cookies.nToken;
            const userId = Helper.decodeToken(token)
            const user = await User.query().findById(userId);
            res.render('userHome', {Name: user.name})
        } else {
            console.log('noo');
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    }  
});

app.post('/userHome', async (req, res) => {
    try {
        if(req.cookies) {
            const token = req.cookies.nToken;
            const userId = Helper.decodeToken(token)
            const user = await User.query().findById(userId);
            const {amount, category, description} = req.body;
            if(!amount) {
                return res.status(400).send({'message': 'Add some amount'});
            }
            const expense = await Expense.query().insert({
                userId: userId,
                amount: amount,
                category: category || null,
                description: description || null,
            });
            if(expense) {
                console.log(expense);
                res.render('userHome', {Name: user.name});
            }        
        } else {
            console.log('noo');
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    }  
});

app.get('/myExpenses', async (req, res) => {
    try {
        if(req.cookies) {
            let sum=0;
            const token = req.cookies.nToken;
            const userId = Helper.decodeToken(token)
            const user = await User.query().findById(userId);
            const expenses = await Expense.query().where('userId', '=', userId);
            const expenseColumn = await Expense.query().where('userId', '=', userId).select(['amount'])
            expenseColumn.forEach((i)=>sum+=i.amount)
            res.render('myExpenses', {foundExpenses: expenses, total:sum})
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

app.get('/signout', async (req, res) => {
    try {
        if(req.cookies) {
            res.clearCookie('nToken');
            res.redirect('/')
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
});

const PORT = process.env.PORT || 8080;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);



 