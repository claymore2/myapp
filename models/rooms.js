var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    name: String,
    type: String,
    members: [],
    memberCnt: Number,
    lastMessage: String,
    lastChatId: String,
    lastChatType: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);