var mongoose = require('mongoose');

var chatSchema = mongoose.Schema({
    ROOM_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    USER_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    USER_NAME: String,
    CHAT_TYPE: String,
    MESSAGE: String,
    //MEMBERS: [],
    UNREAD_CNT: Number,
    UNREAD_MEMBERS: [],
    READ_MEMBERS: [],
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()}
});

module.exports = mongoose.model('Chat', chatSchema);