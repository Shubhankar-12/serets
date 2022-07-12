require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

mongoose.connect("mongodb://localhost:27017/newuserDB");

const app = express();

app.use(express.static('public'));
app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
});

app.post('/login', (req, res) => {
    const userName = req.body.username
    const password = req.body.password
    User.findOne({ email: userName }, (err, foundUser) => {
        if (err)
            console.log(err);
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets.ejs')
                }
                else
                    res.send("No such user found!")
            }
        }
    })
})

app.get('/register', (req, res) => {
    res.render('register.ejs')
})

app.post('/register', (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err) => {
        if (err)
            console.log(err);
        else
            res.render('secrets.ejs');
    })
})

app.listen(3000, () => {
    console.log("Server has been started listening at 3000");
});