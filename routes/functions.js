const logger = require('../config/logger');
const mongoose = require('mongoose');
const User = require('../models/users');
const Chat = require('../models/chats');

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
    },
    saveChat: function(data, callback) {
        var newChat = new Chat();
        newChat['ROOM_ID'] = data.roomId;
        newChat['USER_ID'] = data.userId;
        newChat['USER_NAME'] = data.userName;
        newChat['CHAT_TYPE'] = data.chatType;
        //chatMsg = encodeURIComponent(chatMsg);
        // if (!fn.isEmpty(chatMsg)) {
        //     chatMsg = fn.cryptStr({
        //         'val': chatMsg,
        //         'type': 'bi',
        //         'crypttype': nodeConf.crypttype,
        //         'subtype': 'enc',
        //         'key': roomKey
        //     });            
        // }
        newChat['MESSAGE'] = data.msg;
        //newChat['MEMBERS'] = data.roomMember;
        //newChat['UNREAD_CNT'] = data.unreadMember.length;
        newChat['UNREAD_MEMBERS'] = data.unreadMembers;
        newChat['READ_MEMBERS'] = [];
        if(data.readMembers) {
            newChat['READ_MEMBERS'] = data.readMembers;
        }
        newChat['REG_DT'] = getCurrentDate();

        newChat.save((err) => {
            if (err) logger.error("saveChat: ", err);;
            logger.info("saveChat: ", data.msg);
            if(callback) {
                callback(newChat);
            }
        });
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
    var currentDate = new Date().getTime();
    //logger.info("getCurrentDate!!", currentDate);
    return currentDate;
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

// 배열에서 중복값 찾아서 지우기
function removeArrayDuplicate(array) {
    var a = {};
    for (var i = 0; i < array.length; i++) {
        if (typeof a[array[i]] == "undefined")
            a[array[i]] = 1;
    }
    array.length = 0;
    for (var i in a)
        array[array.length] = i;
    return array;
}

//각언어설정에 맞는 메세지
function fMsg(num, lan) {
    var strSet = {}
    strSet['ko-KR'] = [
        '유저 정보가 없습니다.',
        '요청하신 작업을 실행할 수 없습니다.',
        '요청하신 작업을 실행하였습니다.',
        '요청하신 작업의 실행 권한이 없습니다.',
        '이 글은 관리자에 의해 블라인드 처리 되었습니다.',
        '이 댓글은 관리자에 의해 블라인드 처리 되었습니다.',
    ]
    return strSet[lan][num];
}

function fObjectMerge() {
    for (var i = 1; i < arguments.length; i++)
        for (var a in arguments[i])
        arguments[0][a] = arguments[i][a];
    return arguments[0];
}

module.exports = {
    fnDb: fnDb,
    isLoggedIn: isLoggedIn,
    isEmpty: isEmpty,
    getCurrentDate: getCurrentDate,
    strToObjectId: strToObjectId,
    objectIdToStr: objectIdToStr,
    arraySort: arraySort,
    removeArrayDuplicate: removeArrayDuplicate,
    fMsg: fMsg,
    fObjectMerge: fObjectMerge
}