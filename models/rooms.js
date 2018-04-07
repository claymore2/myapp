var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    ROOM_TYPE: String,
    MEMBERS: [],
    MEMBERS_CNT: Number,
    LAST_MESSAGE: String,
    LAST_CHAT_ID: String,
    LAST_CHAT_TYPE: String,
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()}
});

module.exports = mongoose.model('Room', roomSchema);