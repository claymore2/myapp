const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // req.session.passport.user.id에 저장
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err,user) => {
            done(err, user);
        });
    });

    passport.use('signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: true,
        passReqToCallback: true // callback 에서 req 사용 시
    }, (req, email, password, done) => {
        User.findOne({'email': email}, (err, user) => {
            if(err) return done(err);
            if(user) {
                return done(null, false, req.flash('message','이메일이 존재합니다.'));
                //return done(null, false, { message : '이메일이 존재합니다.'});
            } else {
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.generateHash(password);
                newUser.name = req.body.name;
                newUser.save((err) => {
                    if(err) throw err;
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
        User.findOne({'email': email}, (err, user) => {
            if(err) return done(err);
            if(!user) {
                return done(null, false, req.flash('message','존재하지 않는 이메일입니다.'));
            } 
            if(!user.validPassword(password)) {
                return done(null, false, req.flash('message','비밀번호가 맞지 않습니다.'));
            }
            
            return done(null, user);
        });
    }));
}
