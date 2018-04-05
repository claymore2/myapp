var apiUsers, apiRooms;

apiUsers = (function($) {
    return {
        info : function(id, callback) {
            $.ajax({
                url: "/api/users/"+id,
                method: "GET",
                data: {},
                success: function(data) {
                    callback(data);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        },
        list : function(callback) {
            $.ajax({
                url: "/api/users",
                method: "GET",
                data: {},
                success: function(data) {
                    callback(data);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    }
})(jQuery);

apiRooms = (function($) {
    return {
        save : function(params, callback) {
            $.ajax({
                url: "/api/rooms",
                method: "POST",
                data: params,
                success: function(data) {
                    callback(data);
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    }
})(jQuery);