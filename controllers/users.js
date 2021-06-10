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
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
    } 
};

const getSignUp = async (req, res) => {
    try {
        res.status(200).render('signup')
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
    } 
};

const postSignUp = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        console.log(name, email, password);
        if (!email || !password) {
            res.status(400).render('error', {'message': 'Some values are missing!'});
          }
          if (!Helper.isValidEmail(email)) {
            res.status(400).render('error', {'message': 'Please enter a valid email address!'});
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
                return res.status(200).redirect('/userHome');
              } else {
                res.status(400).render('error', {'message': 'User not saved. Please try again later!'});
              }
          } else {
            res.status(400).render('error', {'message': 'User with that EMAIL already exists!' })
          }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
    } 
};

const getSignIn = async (req, res) => {
    try {
        res.status(200).render('signin')
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
    } 
};

const postSignIn = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            res.status(400).render('error',{'message': 'Some values are missing!'});
        }
        const userExists = await User.query().where('email', '=', email);
        if(userExists.length == 1) {
            if(Helper.comparePassword(userExists[0].password, password)) {
                const token = Helper.generateToken(userExists[0].id);
                console.log('Signed In');
                res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
                res.status(200).redirect('/userHome');
            } else {
                res.status(400).render('error', { 'message': 'Incorrect Password!' }) 
            }
        } else {
            res.status(400).render('error', { 'message': 'No user with that EMAIL exists!' })
        }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
    } 
};

const signOut = async (req, res) => {
    try {
        if(req.cookies) {
            const token = req.cookies.nToken;
            if(token) {
                res.clearCookie('nToken');
                res.status(200).redirect('/')
            } else {
                res.status(400).render('error', { 'message': 'Please log in!' })
            }
        } else {
            res.status(400).render('error', { 'message': 'No Cookie Found!' })
        }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' })
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
