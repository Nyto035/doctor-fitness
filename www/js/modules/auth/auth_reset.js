(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.reset", {
            url: "/reset/:resetCode",
            templateUrl: "res/auth/auth_reset.html",
            controller: authResetCtrl
        });
    }]);

    function authResetCtrl($rootScope, $scope, $alert, $appAPI, $router, $stateParams){
        $rootScope.setTitle("Eko Biashara | Reset Password");
        $scope.passwords = {
            password_change : $stateParams.resetCode,
            password : null,
            password_confirm : null
        };
        $scope.reset = function(event){
            var wait = $alert.wait("Please wait...", event);
            $appAPI.tQuery($scope.passwords, {
                success : function(data){
                    $router.go("home");
                    $alert.success("Request Successful", data, event);
                },
                error : function(error){
                    $alert.warning("Request Failed", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        }
    }

})();