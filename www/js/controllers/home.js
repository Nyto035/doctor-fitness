(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.home', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.homeController', homeController);

    homeController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', '$ionicModal', 'apiBackend',
    ];

    function homeController($scope, frmService, authConfig, UserService, $ionicPlatform,
        $state, $ionicModal, callApi) {
        $scope.title = 'My Businesses';
        $scope.createFields = frmService.createBusiness();
        $scope.loaded = true;
        $scope.user_token = '';
        // $scope.user = authConfig.getUser();
        $ionicPlatform.ready(function () {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user_token = $scope.user.token;
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        });
        $scope.logOutUser = function() {
            console.log("Called");
            UserService.logoutUser().then(function (results) {
                if (results.rows.length > 0 || results.rows.length === 0) {
                    $state.go('login');
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        };
    }
}(window.angular, window._));
