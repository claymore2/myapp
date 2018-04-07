const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
//const uuidv4 = require('uuid/v4');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        //console.log('serializeUser');
        done(null, user.EMAIL); // 인증 성공 시 session 에 저장
    });

    passport.deserializeUser((email, done) => {
        User.findOne({'EMAIL': email}, (err,user) => {
            //console.log('deserializeUser');
            done(err, user._id);
        });
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: true,
        passReqToCallback: true // callback 에서 req 사용 시
    }, (req, email, password, done) => {
        User.findOne({'EMAIL': email}, (err, user) => {
            if(err) return done(err);
            if(user) {
                //return done(null, false, req.flash('message','이메일이 존재합니다.'));
                return done(null, false, {msg : '이메일이 존재합니다.'});
            } else {
                var newUser = new User();
                //var _id = "ObjectId:(\"" + uuidv4() + "\")";
                //newUser._id = _id;
                //newUser.uid = _id;
                newUser.EMAIL = email;
                newUser.PASSWORD = newUser.generateHash(password);
                newUser.NAME = req.body.name;

                newUser.save((err) => {
                    if(err) done(err);
                    return done(null, newUser);
                });
            }
        });
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: true,
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({'EMAIL': email}, (err, user) => {
            if(err) return done(err);
            if(!user) {
                return done(null, false, {msg : '존재하지 않는 이메일입니다.'});
            } 
            if(!user.validPassword(password)) {
                return done(null, false, {msg : '비밀번호가 맞지 않습니다.'});
            }
            
            return done(null, user);
        });
    }));
}
