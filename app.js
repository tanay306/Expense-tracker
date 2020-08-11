const express = require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const A = [];
var totalamount = 0;

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/expenseDB", {useNewUrlParser: true, useUnifiedTopology: true})
const personSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String
});
const Person = new mongoose.model("Person", personSchema)

const userSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  category: String,
  description: String,
});
const User = new mongoose.model("User", userSchema)

app.get("/", function (req, res) {
  res.render("index");
  A.splice(0,A.length)
});

app.get("/signup", function (req, res) {
  res.render("signUp");
});

app.get("/signin", function (req, res) {
  res.render("signIn");
});


app.post("/signup", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newperson = new Person ({
      name: req.body.name,
      username: req.body.username,
      password: hash
    });
    newperson.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/userHome")
        console.log(newperson);
        A.push(newperson.name)
      }
    });
  })
});

app.post("/signin", function (req, res) {
    const userName =  req.body.username;
    const password =  req.body.password;
  Person.findOne({username: userName}, function (err, foundUser) {
    console.log(userName);
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.redirect("/userHome");
            A.push(foundUser.name);
            console.log("found");
          } else {
            res.send("<h>Username and password not found</h>");
          }
        });
      }
    }
  });
});

app.get("/userHome", function (req, res) {
  console.log(A.length);
  if (A.length === 1) {
    A.forEach((elem) => {
      var qwertyName = _.capitalize(elem);
      res.render("userHome", {Name: qwertyName})
    });
  } else if (A.length === 0){
    res.redirect("/")
  } else {
    console.log("error!");
    res.redirect("/")
  }
});

app.post("/userHome", function (req, res) {
  A.forEach((elem) => {
    let nAme = elem;
    console.log(nAme);
    const newUser = new User({
      name: nAme,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    });
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/userHome");
      }
    })
  });
});

app.get("/myExpenses", function (req, res) {
  A.forEach((elem) => {
    let nAme = elem;
    console.log(nAme);
    User.find({name: nAme}, function (err, foundUsers) {
      if (err){
        console.log(err);
      } else {
         B = [];
         totalamount = 0;
        foundUsers.forEach((i) => {
          B.push(i.amount);
          console.log(B);
          totalamount = B.reduce(function (a, b) {
            return a + b;
          });
        });
        res.render("myExpenses", {foundUsers: foundUsers, total: totalamount})
      }
    })
  });

})

app.listen(3000, function () {
  console.log("Server has statrted on port 3000");
});
