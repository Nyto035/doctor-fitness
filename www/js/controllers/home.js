(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.home', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.homeController', homeController);

    homeController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', '$ionicModal', 'apiBackend',
        'app.services.workoutProfile', '$timeout', '$ionicPopover'
    ];

    function homeController($scope, frmService, authConfig, UserService, $ionicPlatform,
        $state, $ionicModal, callApi, fitness, $timeout, $ionicPopover) {
        $scope.title = 'My Businesses';
        $scope.loaded = true;
        $scope.user_token = '';
        $scope.today = new Date();

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
        // Popover
         $scope.createPopover = function popFxn($event) {
            $ionicPopover.fromTemplateUrl('templates/exercise_description.html', {
                scope: $scope,
                id: 1,
            })
            .then(function(popover) {
                $scope.popover = popover;
            });
        };
        // $scope.user = authConfig.getUser();
        $ionicPlatform.ready(function () {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user_token = $scope.user.token;
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    $scope.getConfigs();
                    $scope.createModal();
                    $scope.createPopover();
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        });
        $scope.openModal = function($event, an_excer) {
            $scope.modal.show($event);
            $scope.currentExercise = an_excer;
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        // timer functions
        $scope.counter = 30;
        var mytimeout = '';
        $scope.updateCounter = function timeFxn(){
            $scope.counter--;
            $scope.counter = ('00' + $scope.counter).slice(-2);
            if ($scope.counter > 0) {
                mytimeout = $timeout($scope.updateCounter,1000);
            }
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
            $scope.counter = 30;
        };
        $scope.openPopover = function($event, context, account) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function($event, context, account) {
            $scope.popover.hide($event);
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $scope.popover.remove();
        });
        $scope.$on('modal.hidden', function(event, modal) {
            if (modal.id === 1){
                $scope.popover.hide();
            }
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
        // Graph scafold
        var chart = c3.generate({
            bindto: '#chart',
            data: {
                x: 'Oct',
                columns: [
                    ['Oct', 21, 22, 23, 24, 25],
                    ['Current Weight', 70, 72, 69, 67.5, 68],
                    ['Expected Weight', 64, 65, 67, 65, 65],
                ]
            }
        });

        var chartTwo = c3.generate({
            bindto: '#doughnut',
            data: {
                columns: [
                    ['data4', 30],
                    ['data5', 120],
                ],
                type : 'donut',
                onclick: function (d, i) { console.log("onclick", d, i); },
                onmouseover: function (d, i) { console.log("onmouseover", d, i); },
                onmouseout: function (d, i) { console.log("onmouseout", d, i); }
            },
            donut: {
                title: "Body Exercises"
            }
        });

        $scope.loadGraphs = function statsFxn() {
            setTimeout(function () {
                chart.load({
                    columns: [
                        ['Expected Weight', 66, 65, 65, 67, 64]
                    ]
                });
            }, 1000);
            setTimeout(function () {
                chart.load({
                    ids: 'Current Weight'
                });
            }, 2000);
        };

        $scope.pieChart = function aChartFxn() {
            setTimeout(function () {
                chartTwo.load({
                    columns: [
                        ["Upper Body", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4],
                        ["Lower Body", 1.4, 1.5, 1.5, 1.3, 1.5],
                        ["Leg Exercises", 2.5, 1.9, 2.1, 1.8, 2.2],
                    ]
                });
            }, 800);

            setTimeout(function () {
                chartTwo.unload({
                    ids: 'data4'
                });
                chartTwo.unload({
                    ids: 'data5'
                });
            }, 1000);
        };

        $ionicPlatform.ready(function () {
            $scope.loadGraphs();
            $scope.pieChart();
        });
    }
}(window.angular, window._));
