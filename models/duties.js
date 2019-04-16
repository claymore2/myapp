var mongoose = require('mongoose');

// 일정 그룹
var duty_groups = mongoose.Schema({
	_id:String,
	GROUP_KEY: String,
	GROUP_TYPE: {type:String,default:'S'},
	GROUP_NAME: String,
	GROUP_NAME_ORI: String,
	GROUP_AVATAR: String,
	GROUP_ADMIN_UID:[],
	GROUP_MEMBER:[], // 그룹 멤버 (UID, WRITE_DATE)
	OUT_MEMBER:[],
	GROUP_INVITE_TYPE:String,
	GROUP_INVITE_MEMBER:[],
	GROUP_REJECT_MEMBER:[],
	GROUP_ALARM_EXCEPT_MEMBER:[],
	MY_FAV_GROUP_YN : String,
	WRITE_DATE : {type:Number,default:new Date().getTime()},
	WRITER_INFO :{},
	GROUP_USE_YN : {type:String,default:'Y'}
});

// 일정
var duties = mongoose.Schema({
	_id:String,
	DUTY_KEY: String,
	DUTY_DATE: Number,
	DUTY_TYPE: String, // 일정 타입 (ALL, D, E, N, OFF)
	START: String,
	END: String,
	START_UNIX: Number,
    END_UNIX: Number,
    ALLDAY_YN: String,
	WRITE_DATE :Number,
	WRITER_INFO :{}
});

// 변경 일정
var duty_changes = mongoose.Schema({
	_id:String,
	DUTY_CHG_KEY: String,
	DUTY_CHG_TYPE: String, // 변경 유형(T: 트레이드, R: 대체근무)
	CHG_FROM_INFO: {}, // 변경 신청자 정보 (UID, DUTY_KEY, DUTY_DATE, DUTY_TYPE)
	CHG_TO_INFO: {}, // 변경 근무자 정보 (있을 시 트레이드, 지정안함 일 시 대체근무..)
	ACCEPT_YN : {type:String,default:'N'}, // (N: 최초값, Y: 승인, C: 반려)
	WRITE_DATE :Number, // 변경 요청일
	WRITER_INFO :{} // 변경 신청 정보
});

module.exports = {"duty_groups":duty_groups, "duties":duties, "duty_changes":duty_changes}