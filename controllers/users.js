const express = require('express');
const User = require('../db/models/users');
const Expense = require('../db/models/expenses')
const Helper = require('../middleware/helpers');
const verify = require('../middleware/auth');

const getHome = async (req, res) => {
    try {
        res.render('index');
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
};

const getSignUp = async (req, res) => {
    try {
        res.render('signup')
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
};

const postSignUp = async (req, res) => {
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
};

const getSignIn = async (req, res) => {
    try {
        res.render('signin')
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
};

const postSignIn = async (req, res) => {
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
};

const signOut = async (req, res) => {
    try {
        if(req.cookies) {
            res.clearCookie('nToken');
            res.redirect('/')
        }
    } catch(err) {
        console.log(err);
        res.json(err)
    } 
};

module.exports = {
    getHome,
    getSignIn,
    postSignIn,
    getSignUp,
    postSignUp,
    signOut
}
