const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Room = require('../models/rooms');
const Chat = require('../models/chats');
const fn = require('../routes/functions');
const async = require("async");

// 방 조회
router.get('/api/rooms', fn.isLoggedIn, function(req, res, next) {
    var myUid = req.user._id;

    Room.find({
        "MEMBERS" : {
            $elemMatch : {
                "_id" : myUid,
                "ROOM_ENTRANCE_DATE" : {$lte : fn.getCurrentDate()}
            }
        }
    }, function(err, rooms) {
        logger.info("GET[/api/rooms] findRoom:", rooms.length);
        if(fn.isEmpty(rooms)) {
            res.json([]);
        } else {
            async.map(rooms, function (room, done) {
                Chat.find({
                    'ROOM_ID': room['_id'],
                    'UNREAD_MEMBERS._id': myUid
                }).count(function (err, unreadMsgCnt) {
                    done(null, {
                        'ROOM_ID': room['_id'],
                        'ROOM_TYPE': room['ROOM_TYPE'],
                        'MEMBERS': room['MEMBERS'],
                        'LAST_MESSAGE' : room['LAST_MESSAGE'],
                        'LAST_CHAT_ID': room['LAST_CHAT_ID'],
                        'LAST_CHAT_TYPE': room['LAST_CHAT_TYPE'],
                        'ROOM_UDT_DT': room['UDT_DT'],
                        'UNREAD_MSG_CNT': unreadMsgCnt
                    });
                });
            }, function (err, rooms_array) {
                if (err) next(err);
                rooms_array.sort(fn.arraySort('UDT_DT')).reverse();
                res.json(rooms_array);
            });
        }
    });
});

// 방 생성
router.post('/api/rooms', fn.isLoggedIn, function(req, res, next) {
    var selectedUsers = req.body.selectedUsers;
    var sUserIds = fn.strToObjectId(selectedUsers);
    var roomType = "1";
    var myUid = req.user._id;
    var myName;
    var myRoomName;

    // 초대된 사람 + 로그인 유저 member array 에 담기
    sUserIds.push(myUid);
    logger.info("POST[/api/rooms] selectedUsers:", fn.objectIdToStr(sUserIds));
    // async.map(selectedUsers, (sUser, done) => {
    //     if (!fn.isEmpty(sUser)) {
    //         var roomMember = {}
    //         roomMember["MEMBERS._id"] = sUser._id;
    //         done(null, roomMember);
    //     } else {
    //         done(null, null);
    //     }
    // }, function (err, members_arr) {
    //     if (err) logger.error(err);
    //     roomMembers = members_arr;
    // });

    Room.find({
        "MEMBERS._id": {$all: sUserIds},
        "ROOM_TYPE": roomType
    }, {"_id": true}, (err, rooms) => {
        logger.info("POST[/api/rooms] findRoom:", rooms.length);
        // 방이 없으면 신규 생성
        if(fn.isEmpty(rooms)) {
            User.find({
                "_id": {$in: sUserIds}
            }, (err, users) => {
                if (err) next(err);
                if (fn.isEmpty(users)) {
                    logger.error('Empty Users...');
                    res.json({error: 'Empty Users...'});
                }

                async.map(users, (user, done) => {
                    var member = {};
                    var roomName = '';
                    var roomEntranceDate = "9999999999999";

                    // 룸 이름
                    users.forEach(function (element, index) {
                        if (users[index]['_id'] != user['_id']) {
                            if (!fn.isEmpty(roomName)) {
                                roomName += ",";
                            }
                            roomName += users[index]['NAME'];
                        }
                        // 이름은 5명까지만 묶어서 저장
                        if (index > 5) return false;
                    });

                    if(myUid.equals(user['_id'])) {
                        myName = user['NAME'];
                        myRoomName = roomName;
                        roomEntranceDate = fn.getCurrentDate();
                        
                    }

                    member['_id'] = user['_id'];
                    member['NAME'] = user['NAME'];
                    member['ROOM_NAME'] = roomName;
                    member['ROOM_ENTRANCE_DATE'] = roomEntranceDate;
                    member['LAST_READ_MSG'] = "";
                    done(null, member);
                }, (err, members_arr) => {
                    var newRoom = new Room();
                    newRoom['ROOM_TYPE'] = roomType;
                    newRoom['MEMBERS'] = members_arr;
                    newRoom['MEMBERS_CNT'] = members_arr.length;
                    newRoom['LAST_MESSAGE'] = "";
                    newRoom['LAST_CHAT_TYPE'] = "110";

                    newRoom.save((err) => {
                        if (err) next(err);

                        var chatMsg = myName + '님이 ' + myRoomName + '방을 생성하였습니다.';
                        fInfoMsg(newRoom['_id'], myUid, myName, myRoomName, newRoom['MEMBERS'], chatMsg);

                        logger.info("POST[/api/rooms] roomSaved: ", fn.objectIdToStr(newRoom['_id']));
                        res.json({
                            'result': 'success',
                            'roomId': newRoom['_id']
                        });
                    });
                });
            });
        } else {
            // 방이 있으면 그대로 return
            logger.info("POST[/api/rooms] existRoom: ", fn.objectIdToStr(rooms[0]['_id']));
            res.json({
                'result': 'success',
                'roomId': rooms[0]['_id']
            });
        }
    });
});

function fInfoMsg(roomId, myUid, myName, myRoomName, roomMember, chatMsg) {
    if (!fn.isEmpty(myUid)) {
        var newChat = new Chat();
        newChat['ROOM_ID'] = roomId;
        newChat['USER_ID'] = myUid;
        newChat['USER_NAME'] = myName;
        newChat['CHAT_TYPE'] = "110";
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
        newChat['MESSAGE'] = chatMsg;
        newChat['MEMBERS'] = roomMember;
        newChat['UNREAD_CNT'] = roomMember.length;
        newChat['UNREAD_MEMBERS'] = roomMember;

        newChat.save((err) => {
            if (err) next(err);
            logger.info("fInfoMsg: ", chatMsg);
        });
    }
}


module.exports = router;