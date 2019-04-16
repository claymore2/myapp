var mongoose = require('mongoose');

var todoSchema = mongoose.Schema({
    USER: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    TITLE: String,
    CONTENT: String,
    COMPLETE: {type : Boolean, default: false},
    CATEGORY: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()}
});

var categorySchema = mongoose.Schema({
    USER: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    NAME: String,
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()}
});

module.exports = {"todos":todoSchema, "categories":categorySchema}