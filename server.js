require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
const logger = require('./config/logger');

// [START] MongoDB --------------------------------
const mongoose = require('mongoose');
// Node.js의 native Promise 사용
mongoose.Promise = global.Promise;
// CONNECT TO MONGODB SERVER
mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info('Successfully connected to mongodb'))
    .catch(e => logger.error(e));
// [END] MongoDB --------------------------------

// [START] Session & Redis ----------------------
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient();

app.use(session({
    secret: '!@#claymore$%^',
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored,
    cookie: {
        maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
    },
    store: new redisStore({
        host: "127.0.0.1",
        port: 6379,
        client: redisClient,
        prefix : "session:",
        db : 0
    }),
}));
// [END] Session & Redis ----------------------

// Passport
const passport = require('passport');
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // session 연결

// Static File Service
app.use(express.static(path.join(__dirname, 'public')));
// Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Flash Message
//const flash = require('connect-flash');
//app.use(flash());

// Routes
app.use(routes);
app.use(require('./routes/restUsers'));
app.use(require('./routes/restChats'));
app.use(require('./routes/restEvents'));

app.use((req, res, next) => { // 404 처리 부분
    res.status(404).send('일치하는 주소가 없습니다');
});
app.use((err, req, res, next) => { // 에러 처리 부분 next(err) 시 호출
    logger.error(err);
    res.status(500).send('서버 에러'); // 500 상태 표시 후 에러 메시지 전송
});

const port = process.env.PORT || 3000;
server.listen(port, () => logger.info('HTTP Server listening on port: '+port));

// Socket.io 웹소켓을 HTTP Server 와 연결
const socketIo = require('socket.io');
const io = socketIo(server);
// Set Socket Events
const socketEvents = require('./socket.js')(io, redisClient);

