var myFunc;
// Socket.io Client
var socket = io('http://localhost/socket.io');

myFunc = (function($) {
    return {
        // 로그인 유저 정보 조회
        getLoginUser : function(callback) {
            apiUsers.info("loginUser", function(data) {
                if(data) {
                    callback({
                        _id: data['_id'],
                        email: data['EMAIL'],
                        name: data['NAME'],
                    });
                }
            });
        },
        // Read a page's GET URL variables and return them as an associative array.
        getUrlVars : function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },

        getFormatDate : function(unixDate, format) {
            var dFormat = "YYYY.MM.DD";
            if(format) {
                dFormat = format;
            }

            return moment(new Date(unixDate)).format(dFormat);
        },

        isToday : function(targetDate) {
            var REFERENCE = moment();
            var TODAY = REFERENCE.clone().startOf('day');
            return moment(targetDate).isSame(TODAY, 'd');
        }
    }
}(jQuery));