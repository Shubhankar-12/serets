require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocacalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/newuserDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocacalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.logIn(user, (err) => {
        if (err)
            console.log(err);
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated())
        res.render('secrets.ejs');
    else
        res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register.ejs')
});

app.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.redirect('/secrets');
            });
        }
    });
});

app.get('/logout', (req, res) => {
    req.logout(req.user, err => {
        if (err)
            console.log(err);
        else
            res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log("Server has been started listening at 3000");
});