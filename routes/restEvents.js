const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Event = require('../models/events');
const fn = require('../routes/functions');
const moment = require('moment');

router.post('/api/events', function(req, res, next) {
    var uid = req.body.uid;
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            logger.info('[/api/events]', uid);
            Event.find({
                'USER_ID': user._id
            }, function(err, events) {
                res.json(events);
            });
        } else {
            res.json(null);
        }
    });
});

router.post('/api/event/mod', function(req, res, next) {
    var uid = req.body.uid;
    var formData = JSON.parse(req.body.formData);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            var sData = {};
            var eventId = formData.eventId;
            var sDate = formData.startDateTxt;
            var eDate = formData.endDateTxt;
            var allDayYn = formData.allDayYn;
            logger.info('[/api/event/mod] eventId, sDate, eDate ', eventId, sDate, eDate);
            if(allDayYn == "Y") {
                eDate = moment(eDate).add(1, 'd').format('YYYY-MM-DD');
            }

            sData['USER_ID'] = user._id;
            sData['TITLE'] = formData.title;
            sData['ALLDAY_YN'] = allDayYn;
            sData['START'] = sDate;
            sData['END'] = eDate;
            if(!fn.isEmpty(formData.startTimeTxt)) {
                sData['START'] += "T" + formData.startTimeTxt;
                sDate += " " + formData.startTimeTxt;
            }
            if(!fn.isEmpty(formData.endTimeTxt)) {
                sData['END'] += "T" + formData.endTimeTxt;
                eDate += " " + formData.endTimeTxt;
            }
            
            sData['START_UNIX'] = new Date(sDate).getTime();
            sData['END_UNIX'] = new Date(eDate).getTime();

            if(!fn.isEmpty(formData.label)) sData['LABEL'] = formData.label;
            if(!fn.isEmpty(formData.label)) sData['MEMO'] = formData.memo;
            if(!fn.isEmpty(formData.label)) sData['PLACE'] = formData.place;
            // 신규 이벤트
            if(fn.isEmpty(eventId)) {
                var newEvent = new Event(sData);
                newEvent.save(function(err) {
                    if (err) {
                        logger.error("saveEvent: ", err);
                        return res.json({
                            'result': 'fail',
                            'msg': '작업 중 오류가 발생하였습니다.'
                        });
                    }
                    res.json({
                        'result': 'success',
                        'msg': '이벤트가 등록되었습니다.'
                    });
                });
            // 수정
            } else {
                Event.update({
                    _id: eventId
                }, {
                    $set: sData
                }, {
                    upsert: true
                }, function(err, rst) {
                    if (err) {
                        logger.error("saveEvent: ", err);
                        return res.json({
                            'result': 'fail',
                            'msg': '작업 중 오류가 발생하였습니다.'
                        });
                    }
                    res.json({
                        'result': 'success',
                        'msg': '이벤트가 수정되었습니다.'
                    });
                });      
            }
        } else {
            res.json({
                'result': 'fail',
                'msg': '유저 정보가 없습니다.'
            });
        }
    });
});

module.exports = router;