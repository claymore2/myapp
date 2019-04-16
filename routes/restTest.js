const router = require('express').Router();
const logger = require('../config/logger');
const User = require('../models/users');
const Event = require('../models/events');
const fn = require('../routes/functions');
const moment = require('moment');

router.get('/api/excel/test', function(req, res, next) {
    // Require library
    var xl = require('excel4node');
    //const groupArr = ["의사,간호사,간호조무사,의료기사,원무행정,총무,약사,기타"];
    const groupArr = [];
    
    // Create a new instance of a Workbook class
    var wb = new xl.Workbook();
    
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('직원 정보');
    var ws2 = wb.addWorksheet('예시 데이터');

    // Create a reusable style
    var headerStyle = wb.createStyle({
        alignment: { 
            vertical: 'center',
            horizontal: 'center',
            wrapText: true
        },
        font: {
            color: 'red'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'yellow'
        }
    });
    var headerStyle2 = wb.createStyle({
        alignment: { 
            horizontal: 'center' 
        },
        font: {
            bold: true,
            color: 'white'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'aqua'
        }
    });
    var numberToString = wb.createStyle({
        numberFormat: '@'
    });

    // Column Width
    ws.row(1).setHeight(40);
    ws.column(1).setWidth(15);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(25);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(20);
    ws.column(6).setWidth(20);
    ws.column(7).setWidth(20);
    ws.column(8).setWidth(20);

    ws.cell(1, 1, 1, 8, true)
        .string('(*)표는 필수 입력 값입니다.  아이디는 이메일로 중복 입력될 수 없습니다. (초기 비밀번호: 휴대폰번호),\n부서정보는 양식다운 전 등록된 부서만 등록가능하니 미리 관리자 화면에서 등록하신 후 양식다운하여 등록하세요.')
        .style(headerStyle);
    ws.cell(2, 1).string('이름(*)').style(headerStyle2);
    ws.cell(2, 2).string('아이디 (이메일)(*)').style(headerStyle2);
    ws.cell(2, 3).string('휴대폰 (*) (숫자만 입력)').style(headerStyle2);
    ws.cell(2, 4).string('내선 (숫자만 입력)').style(headerStyle2);
    ws.cell(2, 5).string('직급(*)').style(headerStyle2);
    ws.cell(2, 6).string('직무').style(headerStyle2);
    ws.cell(2, 7).string('그룹(선택)').style(headerStyle2);
    ws.cell(2, 8).string('부서(선택)').style(headerStyle2);

    for(var i=3; i<=500; i++) {
        ws.cell(i, 3).style(numberToString);
        ws.cell(i, 4).style(numberToString);
    }

    ws.addDataValidation({
        type: 'list',
        allowBlank: true,
        //prompt: 'Choose from dropdown',
        error: '그룹을 선택해 주세요.',
        showDropDown: true,
        sqref: 'G3:G500',
        formulas: groupArr,
    });

    wb.write('Excel.xlsx', res);
});

module.exports = router;