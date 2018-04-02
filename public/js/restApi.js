let apiUsers;

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