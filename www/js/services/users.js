(function (angular) {
    angular.module("app.services.users", [])
        .service("UserService", ["$cordovaSQLite",
            function ($cordovaSQLite) {
                this.getByEmail = function (email) {
                    return $cordovaSQLite.execute(DB, "SELECT * FROM users WHERE email = ?", [email]);
                };

                this.getLoggedInUsers = function () {
                    return $cordovaSQLite.execute(DB, "SELECT * FROM users WHERE logged_in = 1");
                };

                this.logoutUser = function () {
                    return $cordovaSQLite.execute(DB, "UPDATE users SET logged_in = 0 WHERE logged_in = 1");
                };

                this.createUser = function (user) {
                    user.businesses = JSON.stringify(user.businesses);
                    var query = "INSERT INTO users (userid, email, businesses, names, phone, token, session, logged_in) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
                    return $cordovaSQLite.execute(DB, query, [user.userid, user.email, user.businesses, user.names, user.phone, user.token, user.session, 1])
                };

                this.updateUser = function (user) {
                    user.businesses = JSON.stringify(user.businesses);
                    var query = "UPDATE users set email=?, businesses=?, names=?, phone=?, token=?, session=?, logged_in=? WHERE userid = ?";
                    return $cordovaSQLite.execute(DB, query, [user.email, user.businesses, user.names, user.phone, user.token, user.session, 1, user.userid])
                };
            }]);
})(window.angular);
