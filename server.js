require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const login = require('./routes/login');
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

// Set MongoDB
const mongoose = require('mongoose');
// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;
// CONNECT TO MONGODB SERVER
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

// Static File Service
app.use(express.static('public')); // app.use(express.static(path.join(__dirname, 'public')));
// Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session & Passport
app.use(session({
    secret: 'secret key sample',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // session 연결

// Flash Message
const flash = require('connect-flash');
app.use(flash());

// Routes
app.use('/', login);
app.use((req, res, next) => { // 404 처리 부분
    res.status(404).send('일치하는 주소가 없습니다!');
});
app.use((err, req, res, next) => { // 에러 처리 부분 next(err) 시 호출
    console.error(err.stack);
    res.status(500).send('서버 에러!'); // 500 상태 표시 후 에러 메시지 전송
});

http.listen(port, () => console.log(`Server listening on port ${port}`));