const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Room = require('../models/rooms');
const Chat = require('../models/chats');
const fn = require('../routes/functions');
const async = require("async");

// 방 생성
router.post('/api/rooms', fn.isLoggedIn, function(req, res, next) {
    var selectedUsers = req.body.selectedUsers;
    var roomType = "1";
    var myUid = req.user._id;
    var myName = "";
    var myRoomName = "";
    var roomMembers;

    // 초대된 사람 + 로그인 유저 member array 에 담기
    selectedUsers.push({
        _id : myUid
    });
    
    async.map(selectedUsers, (sUser, done) => {
        if (!fn.isEmpty(sUser)) {
            var roomMember = {}
            roomMember["MEMBER._id"] = sUser._id;
            done(null, roomMember);
        } else {
            done(null, null);
        }
    }, function (err, members_arr) {
        if (err) logger.error(err);
        roomMembers = members_arr;
    });

    logger.debug("[/api/rooms] roomMembers: ", roomMembers);

    Room.find({
        $and: roomMembers,
        "ROOM_TYPE": roomType
    }, (err, rooms) => {
        // 방이 없으면 신규 생성
        if(fn.isEmpty(rooms)) {
            User.find({
                $or: selectedUsers
            }, (err, users) => {
                if (err) {
                    logger.error(err);
                    res.json({error: err});
                }
                if (fn.isEmpty(users)) {
                    logger.error('Empty Users...');
                    res.json({error: 'Empty Users...'});
                }

                async.map(users, (user, done) => {
                    var member = {};
                    var roomName = '';

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

                    if(myUid == user['_id']) {
                        myName = user['NAME'];
                        myRoomName = roomName;
                    }

                    member['_id'] = user._id;
                    member['NAME'] = user.name;
                    member['ROOM_NAME'] = roomName;
                    member['ROOM_ENTRANCE_DATE'] = "9999999999999";
                    member['LAST_READ_MSG'] = "";
                    done(null, member);
                }, (err, members_arr) => {
                    var newRoom = new Room();
                    newRoom['ROOM_TYPE'] = roomType;
                    newRoom['MEMBERS'] = members_arr;
                    newRoom['MEMBERS_CNT'] = members_arr.length;
                    newRoom['LAST_MESSAGE'] = "-";
                    newRoom['LAST_CHAT_TYPE'] = "101";

                    newRoom.save((err) => {
                        if (err) {
                            logger.error(err);
                            res.json({error: err});
                        }

                        var chatMsg = myName + '님이 ' + myRoomName + '방을 생성하였습니다.';
                        fInfoMsg(newRoom['_id'], myUid, myName, myRoomName, newRoom['MEMBERS'], chatMsg);

                        res.json([{
                            'roomId': newRoom._id
                        }]);
                    });
                });
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
        chatMsg = encodeURIComponent(chatMsg);
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
        newChat['READ_MEMBERS'] = [myUid];

        newChat.save((err) => {
            if (err) {
                logger.error(err);
                res.json({error: err});
            }
        });
    }
}


module.exports = router;