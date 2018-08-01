var apiUsers, apiRooms, apiChats;

function callAjax(url, method, params, callback) {
    $.ajax({
        url: url,
        method: method,
        data: params,
        success: function(data) {
            if(callback) {
                callback(data);
            }
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
        },
        logout: function() {
            callAjax("/api/logout", "GET", {});
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


apiChats = (function($) {
    return {
        list : function(params, callback) {
            callAjax("/api/chats/list", "POST", params, callback);
        },
        save : function(params, callback) {
            callAjax("/api/chats/save", "POST", params, callback);
        }
    }
})(jQuery);