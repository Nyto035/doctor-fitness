(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.activate", {
            url: "/activate/:activationCode",
            templateUrl: "res/auth/auth_activate.html",
            controller: authActivateCtrl
        });
    }]);

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.activate_old", {
            url: "/activation/:activationCode",
            templateUrl: "res/auth/auth_activate.html",
            controller: authActivateCtrl
        });
    }]);

    function authActivateCtrl($rootScope, $scope, $alert, $appAPI, $router, $stateParams){
        $rootScope.setTitle("Eko Biashara | Account Activation");
        $scope.failed = false;
        $scope.reload = function(){
            window.location.reload();
        };
        $scope.activate = function(){
            $appAPI.tQuery({activate_user_account : $stateParams.activationCode}, {
                success : function(data){
                    $router.go("home");
                    $alert.success("Account Activated!", data);
                },
                error : function(error){
                    $scope.failed = true;
                    $alert.warning("Activation Failed", error);
                }
            });
        };
        setTimeout($scope.activate, 2000);
    }

})();