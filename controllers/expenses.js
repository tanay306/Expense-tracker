const express = require('express');
const User = require('../db/models/users');
const Expense = require('../db/models/expenses')
const Helper = require('../middleware/helpers');
const verify = require('../middleware/auth');

const getUserHome = async (req, res) => {
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
};

const postUserHome = async (req, res) => {
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
}

const getMyExpenses = async (req, res) => {
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
};

module.exports = {
    getUserHome,
    postUserHome,
    getMyExpenses,
}