const router = require('express').Router();
const logger = require('../config/logger');
const fn = require('../routes/functions');
const moment = require('moment');
var mongoose = require('mongoose');
const User = require('../models/users');
const dutyModels = require('../models/duties');
const DutyGroups = mongoose.model('duty_groups', dutyModels.duty_groups);
const Duties = mongoose.model('duties', dutyModels.duties);
const DutyChanges = mongoose.model('duty_changes', dutyModels.duty_changes);
var uuid = require('node-uuid');

// 그룹 생성
router.post('/api/duty/group/mod', function(req, res, next) {
    var uid = req.body.uid;
    var groupKey = req.body.groupkey;
    var groupInviteType = req.body.groupinvitetype;
    var groupName = req.body.groupname;
    var groupType = req.body.grouptype;
    var groupMember = req.body.groupmember;
    var groupInviteMember = req.body.groupinvitemember;
    var outMember = req.body.outmember;

    logger.info('[/api/duty/group/mod]', uid);
    var uData  = {};
    uData._id = uid;
    fn.fnDb.userInfo(uData, function(user) {
        if(user) {
            // 그룹 생성
            var sData = {};
            var queryAddToSet = {};
            var queryPull = {};
            if(fn.isEmpty(groupKey)) {
                groupKey = uuid.v4();
                sData._id = "ObjectId:(\"" + groupKey + "\")";
                sData.GROUP_KEY = groupKey;
                sData.WRITER_INFO = {
                    "UID": user._id,
                    "EMAIL": user.EMAIL,
                    "USER_NAME": user.NAME
                }
                sData.GROUP_ADMIN_UID = [uid];
            }

            if (!fn.isEmpty(groupInviteType)) sData.GROUP_INVITE_TYPE = groupInviteType;
            if (!fn.isEmpty(groupName)) sData.GROUP_NAME = groupName;
            if (!fn.isEmpty(groupName)) sData.GROUP_NAME_ORI = groupName;
            if (!fn.isEmpty(groupType)) sData.GROUP_TYPE = groupType;

            if (!fn.isEmpty(groupMember)) {
                queryAddToSet['GROUP_MEMBER'] = {
                    $each: groupMember
                }
            }

            if (!fn.isEmpty(groupInviteMember)) {
                queryAddToSet['GROUP_INVITE_MEMBER'] = {
                    $each: groupInviteMember
                }
            }
            
            if (!fn.isEmpty(outMember)) {
                queryPull = {
                    'GROUP_MEMBER': {
                        'UID': outMember
                    }
                }
            }

            var updateQuery = {};
            if (!fn.isEmpty(sData)) updateQuery = {
                $set: sData
            }
            if (!fn.isEmpty(queryPull)) updateQuery = fn.fObjectMerge(updateQuery, {
                $pull: queryPull
            });
            if (!fn.isEmpty(queryAddToSet)) updateQuery = fn.fObjectMerge(updateQuery, {
                $addToSet: queryAddToSet
            });

            DutyGroups.update({
                "GROUP_KEY": groupKey
            }, updateQuery, {
                upsert: true
            },function(err, rst) {
                if (err) {
                    logger.error('[/api/duty/group/mod]', err);
                    return res.status(500).json({
                        error: err
                    });
                }
                res.json({
                    'result': 'success',
                    'groupKey': groupKey
                });
            });
        } else {
            res.json({
                'result': 'error',
                'msg': fn.fMsg(0, 'ko-KR')
            });
        }
    });
});

module.exports = router;