var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
    USER_ID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    TITLE: String,
    START: String,
    END: String,
    START_UNIX: Number,
    END_UNIX: Number,
    LABEL: String,
    MEMO: String,
    PLACE: String,
    ALLDAY_YN: String,
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()}
});

module.exports = mongoose.model('Event', eventSchema);