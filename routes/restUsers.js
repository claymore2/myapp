const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const fn = require('../routes/functions');

router.get('/', function(req, res, next) {
    User.find({}, (err, users) => {
        if(err) logger.error('error', err);
        //logger.info(users);
        res.json(users);
    });
});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    //logger.info("id: " + id);

    // 로그인 유저 정보
    if(id == "loginUser") {
        if(!req.user) {
            res.json(null);
        }
        id = req.user._id;
    }

    let uData  = {};
    uData._id = id;
    fn.fnDb.userInfo(uData, function(user) {
        res.json(user);
    });

    // User.findOne({_id: id}, (err, user) => {
    //     if(err) throw err;
    //     res.json(user);
    // });
});

module.exports = router;