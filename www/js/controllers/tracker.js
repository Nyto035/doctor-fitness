(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.tracking', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.trackController', homeController);

    homeController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', '$ionicModal', 'apiBackend',
        'app.services.workoutProfile', '$timeout', '$ionicPopover', 'locService',
        '$ionicPopup', '$ionicLoading', '$cordovaGeolocation',
    ];

    function homeController($scope, frmService, authConfig, UserService, $ionicPlatform,
        $state, $ionicModal, callApi, fitness, $timeout, $ionicPopover, locService,
        $ionicPopup, $ionicLoading, $cordovaGeolocation) {
        $scope.title = 'My Businesses';
        $scope.loaded = true;
        $scope.user_token = '';
        $scope.today = new Date();
        var SECOND = 1000;
        var MINUTE = SECOND * 60;
        var HOUR = MINUTE * 60;
        var DAY = HOUR * 24;
        $scope.clearLocWatcher = function clrWatchFxn(watch) {
            $scope.isWatching = false;
            $timeout.cancel(mytimeout);
        };
        var mytimeout = '';
        $scope.watchPosition = function watchFxn() {
            // var deferred = $q.defer();
            $scope.isWatching = true;
            locService.getLocation()
            .then(function(position) {
                console.log(position);
            }, function(err) {
                $ionicPopup.alert({
                    title: 'Unable to determine location!',
                    template: "Ensure GPS is enabled, you are in an open field and" +
                    " try restaring your device.<br>(Code: " + error.code +
                    "<br>Message: " + error.message + ")"
                });
                console.log(error);
            });
            mytimeout = $timeout($scope.watchPosition,5000);
        };
        $scope.getCurrentLocation = function locFxn() {
            $ionicLoading.show();
            locService.getLocation()
            .then(function(position) {
                var lat  = position.coords.latitude
                var long = position.coords.longitude
                var latlong = {lat: parseFloat(lat), lng: parseFloat(long)};
                $scope.src = {lat: parseFloat(lat), lng: parseFloat(long)};
                var geocoder = new google.maps.Geocoder;
                geocoder.geocode({'location': latlong}, function(results, status) {
                    if (status === 'OK' && results[0]) {
                        $scope.from_name = results[0].formatted_address;
                        console.log($scope.from_name);
                    }
                });
                $ionicLoading.hide();
            }, function(err) {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Unable to determine location!',
                    template: "Ensure GPS is enabled, you are in an open field and" +
                    " try restaring your device.<br>(Code: " + error.code +
                    "<br>Message: " + error.message + ")"
                });
                console.log(error);
            });
        };
        // $scope.user = authConfig.getUser();
        $ionicPlatform.ready(function () {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user_token = $scope.user.token;
                    $scope.getCurrentLocation();
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        });
    }
}(window.angular, window._));
