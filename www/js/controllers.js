angular.module('starter.controllers', [])

  .controller('AppCtrl', ["$rootScope", "$scope", "$session", "$tokenAuth", "$router", "$ionicModal", "$timeout", "$http", function ($rootScope, $scope, $session, $tokenAuth, $router, $ionicModal, $timeout, $http) {

    $scope.reapply = function () {
      if (!$scope.$$phase) $scope.$apply();
    };
    $rootScope.reapply = function () {
      if (!$rootScope.$$phase) $rootScope.$apply();
    };
    $rootScope.title = $session.settings.defaultHomeTitle;
    $rootScope.isMainLoading = false;
    $rootScope.session = null;
    $rootScope.setTitle = function (str) {
      $rootScope.title = str;
    };
    $rootScope.isAuthenticated = function () {
      if ($session.sessionKeys.length > 0 && objectHasKeys($rootScope.session)) {
        var complete = true;
        for (var i = 0; i < $session.sessionKeys.length; i++) {
          var sessionKey = $session.sessionKeys[i];
          if (!$scope.session.hasOwnProperty(sessionKey)) {
            complete = false;
            break;
          }
        }
        return complete;
      }
      return false;
    };
    $rootScope.isLocked = function () {
      return objectHasKeys($rootScope.session)
        && $rootScope.session.hasOwnProperty("locked")
        && "boolean" === typeof $rootScope.session.locked
        && $rootScope.session.locked;
    };
    $rootScope.lockSession = function (event) {
      var lock = function () {
        $rootScope.session.locked = true;
        $router.go($session.settings.lockState, $session.settings.lockStateParams);
        $rootScope.$broadcast("session_lock");
      };
      if ("undefined" === typeof event || event === null) {
        lock();
      }
      else {
        $ionicPopup.alert({
          title: "Confirm",
          template: "Lock Session Are you sure you want to lock this session?"
        }, "Yes", event, function () {
          lock();
        });
      }
    };
    $rootScope.logoutSession = function (event, redirectToLogin) {
      $alert.confirm(
        {
          title: "Confirm",
          template: "Logout Are you sure you want to sign out this session?"
        }, "Yes", event, function () {
          $rootScope.session = null;
          if ("boolean" === typeof redirectToLogin && redirectToLogin) $router.go($session.settings.loginState, $session.settings.loginStateParams);
          else $router.go($session.settings.defaultHomeState, $session.settings.defaultHomeStateParams);
          for (var key in $rootScope) {
            if (key.substring(0, 1) !== '$' && "function" !== typeof $rootScope[key]) {
              delete $rootScope[key];
            }
          }
          $rootScope.$broadcast("session_logout");
        });
    };
    $rootScope.setMainLoading = function (bool) {
      $rootScope.isMainLoading = bool;
    };
    $rootScope.setSession = function (data) {
      $rootScope.session = data;
    };
    $rootScope.idleLockListener = null;
    $rootScope.stopIdleLockListener = function () {
      if ($rootScope.idleLockListener != null && !isNaN($rootScope.idleLockListener)) {
        clearInterval($rootScope.idleLockListener);
      }
    };
    if ($session.settings.protectSessionOnIdle) {
      var counter = 0,
        limit = $session.settings.protectSessionOnIdleTimeout,
        tickInterval = 60000,
        doc = document.documentElement;
      doc.addEventListener("mousemove", function () {
        counter = 0;
      });
      doc.addEventListener("keypress", function () {
        counter = 0;
      });
      $rootScope.idleLockListener = setInterval(function () {
        counter = counter + tickInterval;
        if (counter >= limit) {
          $rootScope.lockSession();
          counter = 0;
        }
      }, tickInterval);
    }
    if (!$rootScope.isAuthenticated() && !emptyString($tokenAuth.getToken())) {
      $tokenAuth.getTokenSession($session.settings.tokenAuthDeleteOnError, $session.settings.tokenAuthLogError).then(
        function (data) {
          $rootScope.session = data;
          $rootScope.$broadcast("token_auth_complete");
        },
        function () {
          $rootScope.$broadcast("token_auth_complete");
        }
      );
    }
    if ($session.settings.routingProtection) {
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {
        var routeManager = function (event, toState, toParams) {
          var isProtectedState = $session.protectedStates.indexOf(toState.name) > -1;
          var redirect = function (stateName, stateParams) {
            if (event !== null) event.preventDefault();
            $router.go(stateName, stateParams);
          };
          if (isProtectedState && $rootScope.isLocked()) {
            redirect($session.settings.lockState, $session.settings.lockStateParams);
          }
          else if (isProtectedState && !$rootScope.isAuthenticated()) {
            redirect($session.settings.loginState, $session.settings.loginStateParams);
          }
          else if (!isProtectedState && $rootScope.isAuthenticated() && $session.settings.blockNonProtectedStates) {
            redirect($session.settings.sessionState, $session.settings.sessionStateParams);
          }
          else if (event === null) redirect(toState.name, toParams);
        };
        if (toState.name != "redirecting" && $tokenAuth.isAuthenticating()) {
          event.preventDefault();
          $rootScope.setMainLoading(true);
          $rootScope.$on("token_auth_complete", function () {
            routeManager(null, toState, toParams);
          });
        }
        else routeManager(event, toState);
      });
    }
  }])
  .controller('homeCtrl', homeCtrl);
function homeCtrl($rootScope, $scope, $appAPI, $ionicPopup, $ionicLoading, $session, $router) {
  $scope.logginin = function () {
    $ionicLoading.show({
      template: '<p>signing in...</p><ion-spinner icon="lines"></ion-spinner>'
    });
  };

  $scope.goaway = function () {
    $ionicLoading.hide();
  };
  $scope.auth = { login_email_session: null, password: null };
  $scope.login = function (event) {
    if (emptyString($scope.auth.login_email_session) || emptyString($scope.auth.password)) {

      $ionicPopup.alert({
        title: 'Login Error!',
        template: "Incomplete Please enter your credentials to continue"
      }, event);
      event.preventDefault();
      return;
    }
    $scope.logginin($ionicLoading, event);
    $appAPI.query($scope.auth, {
      success: function (data) {
        $appAPI.saveToken(data.token);
        $rootScope.session = data;
        $router.go($session.settings.sessionState, $session.settings.sessionStateParams);
      },
      error: function (error, xhr) {
        console.error("Login error", error, xhr);
        $ionicPopup.alert({
          title: "Login Error!",
          template: error
        }, event);

      },
      then: function () {
        $scope.goaway($ionicLoading);
      }
    });
  };
  $scope.user = { phone: null, register_user_by_email: null, password: null, password_confirm: null };
  $scope.show = function () {
    $ionicLoading.show({
      template: '<p>Creating your new account...</p><ion-spinner icon="lines"></ion-spinner>'
    });
  };

  $scope.hide = function () {
    $ionicLoading.hide();
  };
  $scope.register = function (event) {
    if (emptyString($scope.user.register_user_by_email) || emptyString($scope.user.password) || emptyString($scope.user.phone)) {
      $ionicPopup.alert({
        title: "sign up Error!",
        template: "Incomplete ,Please fill in the registration form to continue",
      }, event);
      event.preventDefault();
      return;
    }
    $scope.show($ionicLoading, event);
    $appAPI.query($scope.user, {
      success: function (data) {
        $scope.alert({
          title: "SUCCESS!",
          template: "Registration Success!"
        }, data, event);
      },
      error: function (error, xhr) {
        console.error("Registration error", error, xhr);
        $ionicPopup.alert({
          title: "Signup ERROR!",
          template: error

        } , event);
      },
      then: function () {
        $scope.hide($ionicLoading);
      }
    });
  };
}
