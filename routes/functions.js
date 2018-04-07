const logger = require('../config/logger');
const User = require('../models/users');

// DB 공통 함수
var fnDb = {
    userInfo: function(uData, callback) {
        if(!isEmpty(uData) && !isEmpty(uData._id)) {
            var prj = simpleUserInfoProjection;
            User.findOne(uData, prj, (err, user) => {
                if(err) logger.error('error', err);
                callback(user);
            });
        } else {
            callback(null);
        }
    }
}

// Projection
var simpleUserInfoProjection = {
    _id: true,
    EMAIL: true,
    NAME: true
}

// 로그인 여부 체크
var isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/login');
    }
}

//값이 있는지 체크
var isEmpty = function (value) {
    if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
      return true
    } else {
      return false
    }
}

var getCurrentDate = function() {
    return new Date().getTime();
}


module.exports = {
    fnDb: fnDb,
    isLoggedIn: isLoggedIn,
    isEmpty: isEmpty,
    getCurrentDate: getCurrentDate
}