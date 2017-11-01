(function (angular) {
    angular.module("app.services.location", [])
        .service("locService", ["$cordovaGeolocation", "GPS_OPTIONS", '$q',
            function ($cordovaGeolocation, GPS_OPTIONS, $q) {
                this.getLocation = function () {
                    var deferred = $q.defer();
                    var watch = $cordovaGeolocation.watchPosition(GPS_OPTIONS);
                    var clearWatch = function () {
                        watch.clearWatch();
                    };
                    watch.then(null, function (error) {
                        deferred.reject(error);
                        clearWatch();
                    }, function (position) {
                        deferred.resolve(position);
                        clearWatch();
                    });
                    return deferred.promise;
                };
            }
        ]);
})(window.angular);
