const express = require("express");
const bodyParser= require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
//hashing and salting passwords using bcrypt and declaring saltrounds = 10
const bcrypt = require("bcrypt");
const saltRounds = 10;
const A = [];
var totalamount = 0;

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//connecting mongoDb with the help of mongoose
mongoose.connect("mongodb://localhost:27017/expenseDB", {useNewUrlParser: true, useUnifiedTopology: true})
 //creating a new personSchema for each person
const personSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String
});
const Person = new mongoose.model("Person", personSchema)

//creating a userSchema for each person in personSchema
const userSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  category: String,
  description: String,
});
const User = new mongoose.model("User", userSchema)

app.get("/", function (req, res) {
  //render index.ejs
  res.render("index");
  A.splice(0,A.length)
});

app.get("/signup", function (req, res) {
  //render signUp.ejs
  res.render("signUp");
});

app.get("/signin", function (req, res) {
  //render signIn.ejs
  res.render("signIn");
});


app.post("/signup", function (req, res) {
  //creating new person in personSchema and encrypting password of the user
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newperson = new Person ({
      name: req.body.name,
      username: req.body.username,
      password: hash
    });
    //saving person in the database with password encrypted
    newperson.save(function (err) {
      if (err) {
        //if err log err
        console.log(err);
      } else {
        //redirect into specific user home
        res.redirect("/userHome")
        // console.log(newperson);
        A.push(newperson.name)
      }
    });
  })
});

app.post("/signin", function (req, res) {
  //taking username and password when user fills the form in sign in page
  const userName =  req.body.username;
  const password =  req.body.password;
  //find one person in database whose username and password match with the entered username and password and open users home page
  Person.findOne({username: userName}, function (err, foundUser) {
    // console.log(userName);
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        //to check if the password entered is correct by using bcrypt.compare
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            //if the password matches then redirect to home page of the user
            res.redirect("/userHome");
            //add the name of the user in A
            A.push(foundUser.name);
            // console.log("found");
          } else {
            //else send that username and password do not match
            res.send("<h>Username and password not found</h>");
          }
        });
      }
    }
  });
});

app.get("/userHome", function (req, res) {
  // console.log(A.length);
  //every time person views / array A is null
  //when person signs in name of the person is stored in A
  if (A.length === 1) {
    A.forEach((elem) => {
      //display name of the person and capitalize it using lodash
      var qwertyName = _.capitalize(elem);
      res.render("userHome", {Name: qwertyName})
    });
  } else if (A.length === 0){
    res.redirect("/")
  } else {
    // if some unexpected error log error
    console.log("error!");
    res.redirect("/")
  }
});

app.post("/userHome", function (req, res) {
  //fill the form to add any expense the name of the person is yet stored in A
  A.forEach((elem) => {
    let nAme = elem;
    // console.log(nAme);
    //take details of the form filled and add in User database
    const newUser = new User({
      name: nAme,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description
    });
    //save the new user in the database
    newUser.save(function (err) {
      //if err log err
      if (err) {
        console.log(err);
      } else {
        //else redirect to the users home-page
        res.redirect("/userHome");
      }
    });
  });
});

app.get("/myExpenses", function (req, res) {
  //find the user in the database and users details
  A.forEach((elem) => {
    let nAme = elem;
    // console.log(nAme);
    //if users name is found his details are stored as a founduser
    User.find({name: nAme}, function (err, foundUsers) {
      if (err) {
        //if err log err
        console.log(err);
      } else {
        //else make table as shown in myExpenses and display it
        //calculate total expense and store it for each user to be called in myExpenses
        B = [];
        totalamount = 0;
        foundUsers.forEach((i) => {
          B.push(i.amount);
          // console.log(B);
          totalamount = B.reduce(function (a, b) {
            return a + b;
          });
        });
        //render myExpenses and display the details of the foundUser and the total expense of the foundUser
        res.render("myExpenses", {foundUsers: foundUsers, total: totalamount})
      }
    });
  });
})

app.listen(3000, function () {
  console.log("Server has statrted on port 3000");
});
