const logger = require('./config/logger');
const User = require('./models/users');
const Room = require('./models/rooms');
const Chat = require('./models/chats');
const fn = require('./routes/functions');

module.exports = (io) => {
    io.on('connection', (socket) => {
        logger.info('Socket connected with id', socket.id);
        socket.on('disconnecting', (reason) => {
            //let rooms = Object.keys(socket.rooms);
            logger.info('Socket disconnecting', socket.id);
        });
        socket.on('error', (error) => {
            logger.error('Socket error', error);
        });


    });
}
