const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', function(req, res){
    //res.sendFile(__dirname + '/index.html');
    fs.readFile('./views/login.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.get('/signup', function(req, res){
    //res.sendFile(__dirname + '/index.html');
    fs.readFile('./views/signup.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.get('/myList', isLoggedIn, function(req, res){
    fs.readFile('./views/myList.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/myList',
    //failureRedirect: '/',
    failureFlash: true
}));

router.post('/login', passport.authenticate('login', {
    successRedirect: '/myList',
    //failureRedirect: '/',
    failureFlash: true
}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/');
    }
}

module.exports = router;