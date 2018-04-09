var apiUsers, apiRooms;

function callAjax(url, method, params, callback) {
    $.ajax({
        url: url,
        method: method,
        data: params,
        success: function(data) {
            callback(data);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

apiUsers = (function($) {
    return {
        info : function(id, callback) {
            callAjax("/api/users/"+id, "GET", {}, callback);
        },
        list : function(callback) {
            callAjax("/api/users", "GET", {}, callback);
        }
    }
})(jQuery);

apiRooms = (function($) {
    return {
        list : function(callback) {
            callAjax("/api/rooms", "GET", {}, callback);
        },
        save : function(params, callback) {
            callAjax("/api/rooms", "POST", params, callback);
        }
    }
})(jQuery);