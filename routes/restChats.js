const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Room = require('../models/rooms');
const Chat = require('../models/chats');
const fn = require('../routes/functions');
const async = require("async");

// 방 리스트 조회
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
                    'UNREAD_MEMBERS': myUid
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
                    logger.error('POST[/api/rooms] Empty User Error');
                    return res.status(500).json({error: 'Empty User Error'});
                }

                async.map(users, (user, done) => {
                    var member = {};
                    var roomName = '';
                    var roomEntranceDate = 9999999999999;

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
                    member['ROOM_NAME_CHG_YN'] = "N";
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
                        
                        var msg = myName + '님이 ' + myRoomName + '방을 생성하였습니다.';
                        var unreadMembers = newRoom['MEMBERS'].map(v => v._id);
                        fn.fnDb.saveChat({
                            roomId: newRoom['_id'],
                            userId: myUid,
                            userName: myName,
                            chatType: "110",
                            msg: msg,
                            unreadMembers: unreadMembers
                        });
                        //fInfoMsg(newRoom['_id'], myUid, myName, newRoom['MEMBERS'], chatMsg);

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

// 채팅 리스트 조회
router.post('/api/chats/list', fn.isLoggedIn, function(req, res, next) {
    var myUid = req.user._id;
    var roomId = req.body.roomId;
    logger.info("POST[/api/chats/list] roomId: ", roomId);
    roomId = fn.strToObjectId(roomId);
    if(!fn.isEmpty(roomId)) {
        Room.findOne({
            _id : roomId
        }, {MEMBERS: true}, (err, room) => {
            var members = room.MEMBERS;
            var roomEntranceDate;
            members.forEach((v, i) => {
                if(members[i]._id.equals(myUid)) {
                    roomEntranceDate = members[i].ROOM_ENTRANCE_DATE;
                }
            });

            Chat.find({
                // 방에 입장한 이 후의 메세지만 보여줌
                $and : [{'ROOM_ID': roomId}, {'REG_DT': {$gte: roomEntranceDate}}]
            }, (err, chats) => {
                if(err) next(err);
                logger.info("POST[/api/chats/list] chats: ", chats.length);
                // 메세지 전부 읽음 처리
                Chat.update({
                    'ROOM_ID': roomId,
                    'UNREAD_MEMBERS': myUid
                },{
                    $pull: {
                        'UNREAD_MEMBERS': myUid
                    },
                    $addToSet: {
                        'READ_MEMBERS': myUid
                    }
                },{
                    multi: true
                }, (err, results) => {});

                res.json(chats);
            // 최신 순으로 20개
            }).sort({
                "REG_DT": -1
            }).limit(20);
        });
    }
});

module.exports = router;