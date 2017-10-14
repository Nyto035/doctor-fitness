(function (angular) {
    angular.module("app.database", [])
    .factory('ionicReady', ['$ionicPlatform', '$q', '$rootScope',
        function($ionicPlatform, $q, $rootScope) {
            var deferred = $q.defer();
            $ionicPlatform.ready(function () {
                console.log('ionic is ready');
                $rootScope.$apply(deferred.resolve);
            });
            return {
                ready: function () {
                    return deferred.promise;
                }
            };
        }
    ])
    .service("DBService", ["$cordovaSQLite", function ($cordovaSQLite) {

            var greaterThanZero = function (value) {
                if (value === null) {
                    return false;
                }
                if (isNaN(parseInt(value, 10))) {
                    return false;
                }
                if (parseInt(value, 10) <= 0) {
                    return false;
                }
                return true;
            };

            var isNull = function (value) {
                if (value === "null") {
                    return true;
                }
                if (value === null) {
                    return true;
                }
                if (value.length < 1) {
                    return true;
                }
                return false;
            };
            this.initialize = function () {
                // $cordovaSQLite.execute(DB, "DROP TABLE IF EXISTS users");
                var query = "CREATE TABLE IF NOT EXISTS users (userid text, email text, businesses text," +
                    "names text, phone text, token text, session text, logged_in integer DEFAULT 0)"
                $cordovaSQLite.execute(DB, query)
                .then(function () {},
                    function (error) {
                        console.log(error);
                    });
            };
        }]);

})(window.angular);


