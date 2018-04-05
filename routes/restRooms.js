const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Room = require('../models/rooms');
const fn = require('../routes/functions');
const async = require("async");

router.post('/', function(req, res, next) {
    var sUsers = req.body.selectedUsers;
    var roomType = "1";
    var uData = {};
    uData._id = req.user._id;

    logger.info("sUsers", sUsers);
    fn.fnDb.userInfo(uData, function(loginUser) {
        // 초대된 사람 + 로그인 유저 member array 에 담기
        sUsers.push({
            _id : loginUser._id
        });
        var members;
        async.map(sUsers, (sUser, done) => {
            if (!fn.isEmpty(sUser)) {
                var member = {}
                member["_id"] = sUser._id;
                done(null, member);
            } else {
                done(null, null);
            }
        }, function (err, members_arr) {
            if (err) logger.error(err);
            members = members_arr;
        });

        Room.find({
            $and: members,
            "type": "1"
        }, (err, rooms) => {
            // 방이 없으면 신규 생성
            if(fn.isEmpty(rooms)) {
                User.find({
                    $or: members
                }, (err, users) => {
                    if (err) {
                        logger.error(err);
                        return res.json({error: err});
                    }
                    if (fn.isEmpty(users)) {
                        logger.error('Empty Users...');
                        return res.json({error: 'Empty Users...'});
                    }

                    async.map(users, (user, done) => {
                        var member = {};
                        roomName = '';

                        // 룸 이름
                        users.forEach(function (element, index) {
                            if (users[index]._id != user._id) {
                                if (!fn.isEmpty(roomName)) {
                                    roomName += ",";
                                }
                                roomName += users[index].name;
                            }
                            // 이름은 5명까지만 묶어서 저장
                            if (index > 5) return false;
                        });

                        member._id = user._id;
                        member.name = user.name;
                        member.roomName = roomName;
                        //member.ROOM_NAME_CHG = "0"
                        member.roomEntranceDate = Date.now();
                        member.lastReadMsg = ""
                        //member.LAST_UNIXTIME = 0
                        done(null, member);
                    }, (err, users_arr) => {
                        var newRoom = new Room();
                        newRoom.type = roomType;
                        newRoom.members = users_arr;
                        newRoom.memberCnt = users_arr.length;
                        newRoom.lastMessage = "-";
                        newRoom.lastChatType = "101";

                        newRoom.save((err) => {
                            if (err) logger.error(err);
                            // if (!fn.isEmpty(myUid)) {
                            //     var chatMsg = myName + '님이 ' + myRoomName + '방을 생성하였습니다.'
                            //     fInfoMsg(roomKey, myUid, myName, myRoomName, member, chatMsg)
                            // }
                            res.json([{
                                'roomId': newRoom._id
                            }]);
                        });
                    });
                });
            }
        });
    });
});


module.exports = router;