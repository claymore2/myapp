require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const routes = require('./routes/routes');
const apiUsers = require('./routes/apiUsers');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const logger = require('./config/logger');

// Set MongoDB
const mongoose = require('mongoose');
// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;
// CONNECT TO MONGODB SERVER
mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('Successfully connected to mongodb'))
    .catch(e => logger.error(e));

// Static File Service
app.use(express.static(path.join(__dirname, 'public')));
// Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session & Passport
app.use(session({
    secret: '!@#claymore$%^',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
    }
}));

app.use(passport.initialize());
app.use(passport.session()); // session 연결

// Flash Message
//const flash = require('connect-flash');
//app.use(flash());

// Routes
app.use('/', routes);
app.use('/api/users', apiUsers);
app.use((req, res, next) => { // 404 처리 부분
    res.status(404).send('일치하는 주소가 없습니다');
});
app.use((err, req, res, next) => { // 에러 처리 부분 next(err) 시 호출
    logger.error(err.stack);
    res.status(500).send('서버 에러'); // 500 상태 표시 후 에러 메시지 전송
});

http.listen(port, () => logger.info('Server listening on port: '+port));