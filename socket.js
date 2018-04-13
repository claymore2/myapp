const logger = require('./config/logger');
const User = require('./models/users');
const Room = require('./models/rooms');
const Chat = require('./models/chats');
const fn = require('./routes/functions');
const async = require("async");

module.exports = (io, redisClient) => {
    io.on('connection', (socket) => {
        var sid = socket.id;
        var uid = "";
        var device = "";
        var roomId = "";

        logger.info('Socket connected with id', sid);

        // 유저가 채팅창에 있는 지 확인
        socket.on('checkConnect', function (data) {
            //logger.info('Socket checkConnect', data);
            var {roomId, uid, device, myStatus} = data;
            var query = {};
            query[device + uid] = uid;
            if (myStatus == "focus") {
                redisClient.hmset(roomId, query)
            } else {
                redisClient.hdel(roomId, device + uid);
            }
        });

        socket.on('disconnect', (reason) => {
            //let rooms = Object.keys(socket.rooms);
            logger.info('Socket disconnect', device + uid);
            redisClient.hdel(roomId, device + uid);
        });

        socket.on('error', (error) => {
            logger.error('Socket error', error);
        });

        // 채팅방 입장
        socket.on('joinRoom', function(data) {
            logger.info('Socket[joinroom]', data);
            var {roomId, uid, device} = data;

            try {
                socket.join(roomId);
                // 방에 입장한 사람 저장
                var query = {};
                query[device + uid] = uid;
                redisClient.hmset(roomId, query);
            } catch(e) {
                logger.error('Socket[joinroom]', e);
            }
        });

        // 채팅방 나가기
        socket.on('leaveRoom', function(data) {
            logger.info('Socket[leaveRoom]', data);
            var {roomId, uid, device} = data;
            // roomId = data.roomId;
            // uid = data.uid;
            // device = data.device;

            try {
                socket.leave(roomId, function (err) {
                    socket.broadcast.to(roomId).emit('notice', data);
                    redisClient.hdel(roomId, device + uid);
                });
            } catch (e) {
                logger.error('Socket[leaveRoom]', e);
            }
        });

        // 채팅 메세지 전송
        socket.on('sendMessage', function(data) {
            logger.info('Socket[sendMessage]', data);
            var {roomId, chatType, msg, userId, userName} = data;
            var oRoomId = fn.strToObjectId(roomId);

            // 현재 채팅창에 있는 멤버
            var readMembers = [];
            var readMembersCnt = 0;
            var unreadMembers = [];
            redisClient.hvals(roomId, function (err, res) {
                logger.info('Socket[sendMessage] redisClient roomId', res);
                readMembers = fn.removeArrayDuplicate(res);
                readMembersCnt = readMembers.length;
            });

            Room.findOne({
                '_id' : oRoomId
            }, {MEMBERS: true, ROOM_TYPE: true}, (err, room) => {
                if(err) logger.error('Socket[sendMessage] error', err);

                if(!fn.isEmpty(room)) {
                    // 1:1 방인 경우 메세지 보낸 시간으로 모든 멤버의 입장 시간 설정 -> 리스트에 노출
                    if (room['ROOM_TYPE'] == "1") {
                        Room.update({
                            '_id': oRoomId,
                            'MEMBERS': {
                                $elemMatch: {
                                    'ROOM_ENTRANCE_DATE': 9999999999999
                                }
                            }
                        }, {
                            $set: {
                                'MEMBERS.$.ROOM_ENTRANCE_DATE': fn.getCurrentDate()
                            }
                        }, {
                            multi: true
                        }, function (err, rst) {
                            if (err) logger.error('Socket[sendMessage] error', err);
                        });
                    }
                    
                    async.map(room['MEMBERS'], (member, done) => {
                        // 현재 채팅창에 없는 멤버 -> Push 보낼 대상
                        //var joinMembers = getSocketsInRoom(roomId);
                        var memberId = fn.objectIdToStr(member._id);
                        if(readMembers.indexOf(memberId) < 0) {
                            unreadMembers.push(member._id);
                        }
                        done(null, member);
                    }, (err, member_arr) => {
                        //var roomMembers = member_arr;
                        //var rommMemberCnt = member_arr.length;
                        logger.info('Socket[sendMessage] readMembers', readMembers.length);
                        logger.info('Socket[sendMessage] unreadMembers', unreadMembers.length);
                        // 채팅 메세지 저장
                        fn.fnDb.saveChat({
                            roomId: oRoomId,
                            userId: userId,
                            userName: userName,
                            chatType: chatType,
                            msg: msg,
                            unreadMembers: unreadMembers,
                            readMembers: fn.strToObjectId(readMembers)
                        }, function(chat) {
                            Room.update({
                                "_id": oRoomId
                            }, {
                                $set: {
                                    'LAST_MESSAGE': msg,
                                    'LAST_CHAT_ID': chat['_id'],
                                    'LAST_CHAT_TYPE': chatType,
                                    'UDT_DT': fn.getCurrentDate()
                                }
                            }, function (err, rst) {});

                            socket.broadcast.to(roomId).emit('broadcastMsg', chat);
                        });
                    });
                }
            });
        });
    });

    function getSocketsInRoom(roomId, namespace = '/') {
        let room = io.nsps[namespace].adapter.rooms[roomId];
        return room.sockets;
    }
}

