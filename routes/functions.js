const logger = require('../config/logger');
const mongoose = require('mongoose');
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

// 값이 있는지 체크
var isEmpty = function (value) {
    if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) {
      return true
    } else {
      return false
    }
}

// 현재 날짜
var getCurrentDate = function() {
    return new Date().getTime();
}

// String to ObjectId
var strToObjectId = function(value) {
    if (value instanceof Array) {
        return value.map(mongoose.Types.ObjectId);
        // return value.map(function(o) {
        //     if(!o instanceof mongoose.Types.ObjectId) {
        //         return mongoose.Types.ObjectId(o);
        //     }
        //     return o;
        // });
    }
    return mongoose.Types.ObjectId(value);
}

// ObjectId to String
var objectIdToStr = function(value) {
    if (value instanceof Array) {
        //return value.map(toString);
        return value.map(function(o) {
            return o.toString();
        });
    }
    return value.toString();
}

// 배열 정렬
var arraySort = function (name, type) {
    return function (o, p) {
      var a, b;
      if (o && p && typeof o === 'object' && typeof p === 'object') {
        a = o[name];
        b = p[name];
        if (a === b) {
          return typeof type === 'function' ? type(o, p) : o;
        }
        if (typeof a === typeof b) {
          return a < b ? -1 : 1;
        }
        return typeof a < typeof b ? -1 : 1;
      }
    }
}

module.exports = {
    fnDb: fnDb,
    isLoggedIn: isLoggedIn,
    isEmpty: isEmpty,
    getCurrentDate: getCurrentDate,
    strToObjectId: strToObjectId,
    objectIdToStr: objectIdToStr,
    arraySort: arraySort
}