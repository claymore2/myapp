const fs = require('fs');
const path = require('path');
const router = require('express').Router();
const passport = require('passport');
const viewPath = './views/';
const logger = require('../config/logger');
const fn = require('../routes/functions');

router.get('/login', function(req, res){
    fs.readFile(viewPath+'login.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.get('/signup', function(req, res){
    if (req.isAuthenticated()){
        return res.redirect('/');
    }

    fs.readFile(viewPath+'signup.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.get('/', fn.isLoggedIn, function(req, res){
    fs.readFile(viewPath+'/index.html', function(err, data) {
        if(err) throw err;
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
    });
});

router.post('/api/signup', function(req, res, next) {
    passport.authenticate('signup', function(err, user, info) {
        if (err) return next(err);
        if (!user || info) {
            res.json({result: 'false', msg: info.msg});
        }
        
        res.json({result: 'success'});
    })(req, res, next);
});

router.post('/api/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
        if (err) return next(err);
        if (!user || info) {
            res.json({result: 'false', msg: info.msg});
        }
        
        // Login
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.json({result: 'success'});
        });
    })(req, res, next);
});

module.exports = router;