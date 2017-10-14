(function () {
    "use strict";

    angular.module("providerPortal.auth.controllers", [])

    .controller("providerPortal.auth.controllers.loginAuth", LoginAuth)

    .controller("providerPortal.auth.controllers.signUp", signupAuth)

    .controller("providerPortal.auth.controllers.logoutAuth", LogoutAuth);

    LogoutAuth.$inject = [
        "$scope", "$state", "$stateParams", "sil.oauth2.authConfig"
    ];
    function LogoutAuth($scope, $state, $stateParams, oauth2) {
        $scope.logout = true;
        var callback = function() {
            $state.go("auth_login", {
                "change_pwd": $stateParams.change_pwd,
                "timeout": $stateParams.timeout
            });
        };
        return oauth2.logout().then(callback).catch(callback);
    }

    LoginAuth.$inject = [
        "$scope", "$state", "sil.oauth2.authConfig",
        "providerPortal.auth.oauth2.token", "HOMEPAGE", "UserService",
    ];
    function LoginAuth($scope, $state, auth, oauth2Token, homepage, UserService) {
        $scope.login = {};
        $scope.isDisabled = false;
        // $scope.$parent.clearFabs();
        // $scope.hideHeader();
        $scope.logginSQL = function logginFxn() {
            UserService.getByEmail($scope.user.email).then(function (results) {
                if (results.rows.length > 0) {
                    UserService.updateUser($scope.user).then(function () {
                        $state.transitionTo(homepage,{},{reload:true, inherit: true, notify: true });
                    },function (error) {
                        console.log(error);
                    });
                } else {
                    UserService.createUser($scope.user).then(function (response) {
                        console.log(response);
                        $state.transitionTo(homepage,{},{reload:true, inherit: true, notify: true });
                    }, function (error) {
                        console.log(error);
                    });
                }
            }).catch(function(error){
                alert('At creating user');
                alert(error);
            });
        };
        $scope.submitUser = function (login) {
            $scope.isDisabled = true;
            $scope.loader = true;
            return oauth2Token.fetchToken(login.login_email_session, login.password)
                .then(function (token) {
                    $scope.loader = false;
                    $scope.isDisabled = false;
                    if (!_.isUndefined(token.data) && !_.isNull(token.data)) {
                        if (token.data.response !== 'error') {
                            $scope.user = token.data.data;
                            $scope.logginSQL();
                        } else{
                            $scope.errorMessage = "Invalid username or password";
                        }
                    } else{
                        $scope.errorMessage = "Connection error occurred check your connectivity";
                    }
                }).catch(function (response) {
                    alert(response);
                    $scope.isDisabled = false;
                    if (response.status === 401 || response.status === 403) {
                        $scope.errorMessage = "Invalid username or password";
                    }
                    else {
                        $scope.errorMessage = "Connection error try again later";
                    }

                });
        };
    }
    // Sign up controller
    signupAuth.$inject = [
        "$scope", "$state", "UserService", "apiBackend",
    ];
    function signupAuth($scope, $state, UserService, callApi) {
        $scope.login = {};
        $scope.isDisabled = false;
        $scope.user = {};
        $scope.is_registered = !_.isUndefined($state.params.email) ? true : false;
        $scope.successMessage = $state.params.msg;
        $scope.createUser = function () {
            $scope.isDisabled = true;
            $scope.loader = true;
            console.log($scope.user);
            callApi.postApi($scope.user)
            .then(function(response){
                $scope.loader = false;
                $scope.isDisabled = false;
                $scope.result = response.data;
                console.log($scope.result);
                if ($scope.result.response === 'success') {
                    $state.go($state.current, 
                        { email: $scope.user.register_user_by_email,  msg: $scope.result.data});
                } else {
                    $scope.errorMessage = $scope.result.data;
                }
            })
            .catch(function(err) {
                $scope.loader = false;
                console.log(err);
            });
        };
    }
})();
