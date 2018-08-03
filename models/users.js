var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    NAME: String,
    EMAIL: String,
    PASSWORD: String,
    //REG_DT: {type : Date, default: Date.now},
    //UDT_DT: {type : Date, default: Date.now}
    REG_DT: {type : Number, default: new Date().getTime()},
    UDT_DT: {type : Number, default: new Date().getTime()},
});

// password를 암호화
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// password의 유효성 검증
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.PASSWORD);
};

module.exports = mongoose.model('User', userSchema);