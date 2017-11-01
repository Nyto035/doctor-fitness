var DB = null;
var DB_NAME = "ecko.db";

angular.module('starter', [
    'ionic',
    'ngCordova',
    'ngMap',
    // 'starter.controllers',
    'starter.routes',
    // 'starter.services',
    'sil.auth.backend',
    'sil.datalayer',
    'providerPortal.auth',
    'app.services',
    'app.controllers',
    'app.database',
    ])

    .constant("GPS_OPTIONS", {
        maximumAge: 0,
        timeout: 1000 * 60 * 3, // 10 mins
        enableHighAccuracy: true
    })

    .run(["ionicReady", "$cordovaSQLite", "DBService", "$rootScope",
        "UserService", "$state", "$cordovaDevice", "$timeout",
        function (ionicReady, $cordovaSQLite, DBService, $rootScope,
            UserService, $state, cordovaDevice, $timeout) {
        var dbCreate = function dbFxn() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
            if (window.cordova) {
                DB = $cordovaSQLite.openDB({
                    name: DB_NAME,
                    location: 2
                });
                console.log('Is cordova', DB);
            } else { // "my.db", '1', 'my', 1024 * 1024 * 100
                DB = window.openDatabase(DB_NAME, '1.0', 'my', 1024 * 1024 * 100);
                console.log('Is not cordova', DB);
            }
            DBService.initialize();
        }
        ionicReady.ready().then(function () {
            dbCreate();
        });
        $timeout(function(){
            dbCreate();
        },5000);
    }])

    /*.config(['DBProvider', function(dbProvider) {
        dbProvider.createDB();
    }])*/

    .run(['app.services.redirectTo', (r) => {
        r.redirectTo();
    }])

    .run(["silDataStoreFactory", "silDataLayerUtils", "SETTINGS", function (silDataStoreFactory, utils, SETTINGS) {
         silDataStoreFactory("ecko", {
            "url": utils.urlJoin(
                SETTINGS.EDI_SERVER, ""
            ),
            cache: false
        });
    }])

    .run(["$state", "$rootScope", "UserService", "ionicReady", "$timeout",
        function ($state, $rootScope, UserService, ionicReady, $timeout) {
        var redirectFxn = function loadFxn(toState, evt) {
            if(toState.name === 'app.home'){
                UserService.getLoggedInUsers()
                .then(function(resp){
                    if(!_.isUndefined(resp.rows) && resp.rows.length <= 0){
                        evt.preventDefault();
                        $state.go('login');
                    } else if(_.isUndefined(resp) || _.isNull(resp)){
                        evt.preventDefault();
                        $state.go('login');
                    } else {
                        $state.go(toState.name);
                    }
                })
                .catch(function(err){
                    console.log(err);
                });
            }
        };
        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
            ionicReady.ready().then(function () {
                console.log('State change success', toState.name);
                if (fromState.name === '' && 
                    (toState.name === 'app.home') || (toState.name === 'app')){
                    event.preventDefault();
                    UserService.getLoggedInUsers()
                    .then(function(results){
                        if(results.rows.length <= 0 && toState.name !== 'registration'){
                            $state.go("login");
                        } else {
                            $state.go('app.home');
                        }
                    })
                    .catch(function(errror){
                        NotificationService.showError(error);
                    });
                }
            });
        });
    }])

    /*.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    }])*/

    .config(['$urlRouterProvider', '$ionicConfigProvider', function ($urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.maxCache(0);
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise("app/home");
    }]);
 
