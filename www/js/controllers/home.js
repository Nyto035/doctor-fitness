(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.home', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.homeController', homeController);

    homeController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', '$ionicModal', 'apiBackend',
        'app.services.workoutProfile', '$timeout',
    ];

    function homeController($scope, frmService, authConfig, UserService, $ionicPlatform,
        $state, $ionicModal, callApi, fitness, $timeout) {
        $scope.title = 'My Businesses';
        $scope.createFields = frmService.createBusiness();
        $scope.loaded = true;
        $scope.user_token = '';
        $scope.getConfigs = function conFxn() {
            if ($state.current.name === 'app.exercises') {
                $scope.exercises = fitness.exerciseDetails();
                $scope.loaded = false;
            } else if ($state.current.name === 'app.meal_plan') {
                console.log('Called');
                $scope.meals = fitness.mealsDetails();
                $scope.loaded = false;
            }
        };
        // $scope.user = authConfig.getUser();
        $ionicPlatform.ready(function () {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user_token = $scope.user.token;
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    $scope.getConfigs();
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        });
        // creating modals
         $scope.createModal = function() {
            $ionicModal.fromTemplateUrl('templates/exercise_details.html', {
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
            });
        };
        $scope.createModal();
        $scope.openModal = function($event, an_excer) {
            $scope.modal.show($event);
            $scope.currentExercise = an_excer;
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // timer functions
        $scope.counter = 0;
        var mytimeout = '';
        $scope.updateCounter = function timeFxn(){
            $scope.counter++;
            $scope.counter = ('00' + $scope.counter).slice(-2);
            mytimeout = $timeout($scope.updateCounter,1000);
        };
        $scope.startTimer = function startFxn() {
            $scope.activateStop = true;
            $scope.updateCounter();
        };
        $scope.stopTimer = function(){
            $scope.activateStop = false;
            $timeout.cancel(mytimeout);
        }
        $scope.resetCounter = function resetFxn() {
            $timeout.cancel(mytimeout);
            $scope.counter = 0;
        };
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
