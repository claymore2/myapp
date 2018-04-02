const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');

router.get('/', function(req, res, next) {
    User.find({}, (err, users) => {
        if(err) throw err;
        //logger.info(users);
        res.json(users);
    });
});

router.get('/:id', function(req, res, next) {
    let id = req.params.id;
    logger.info("id: " + id);
    if(id == "loginUser") {
        if(!req.user) {
            res.json(null);
        }
        id = req.user._id;
    }
    User.findOne({_id: id}, (err, user) => {
        if(err) throw err;
        //logger.info(users);
        res.json(user);
    });
});

module.exports = router;