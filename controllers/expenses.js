const express = require('express');
const User = require('../db/models/users');
const Expense = require('../db/models/expenses')
const Helper = require('../middleware/helpers');
const verify = require('../middleware/auth');

const getUserHome = async (req, res) => {
    try {
        if(req.cookies) {
            const token = req.cookies.nToken;
            if(token) {
                const userId = Helper.decodeToken(token);
                const user = await User.query().findById(userId);
                res.status(200).render('userHome', {Name: user.name, message: null, status:false});
            } else {
                res.status(400).render('error', { 'message': 'Please log in!' });
            }
        } else {
            res.status(400).render('error', { 'message': 'No Cookie Found!' });
        }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' });
    } 
};

const postUserHome = async (req, res) => {
    try {
        if(req.cookies) {
            const token = req.cookies.nToken;
            if(token) {
                const userId = Helper.decodeToken(token);
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
                    res.status(200).render('userHome', {Name: user.name, message: 'Expense added successfully', status: true});
                } else {
                    res.status(400).render('error', { 'message': 'Expense not processes! Please try again later!' });
                }
            } else {
                res.status(400).render('error', { 'message': 'Please log in!' });
            }
        } else {
            res.status(400).render('error', { 'message': 'No Cookie Found!' });
        }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' });
    } 
};

const getMyExpenses = async (req, res) => {
    try {
        if(req.cookies) {
            let sum=0;
            const token = req.cookies.nToken;
            if(token) {
                const userId = Helper.decodeToken(token);
                const user = await User.query().findById(userId);
                const expenses = await Expense.query().where('userId', '=', userId);
                const expenseColumn = await Expense.query().where('userId', '=', userId).select(['amount']);
                expenseColumn.forEach((i)=>sum+=i.amount);
                res.status(200).render('myExpenses', {foundExpenses: expenses, total:sum});
            } else {
                res.status(400).render('error', { 'message': 'Please log in!' });
            }
        } else {
            res.status(400).render('error', { 'message': 'No Cookie Found!' });
        }
    } catch(err) {
        console.log(err);
        res.status(400).render('error', {'message': 'Some error occured while loading the page!' });
    } 
};

module.exports = {
    getUserHome,
    postUserHome,
    getMyExpenses,
};