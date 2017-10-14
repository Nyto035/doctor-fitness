(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.forgot", {
            url: "/forgot",
            templateUrl: "res/auth/auth_forgot.html",
            controller: authActivateCtrl
        });
    }]);

    function authActivateCtrl($rootScope, $scope, $alert, $appAPI, $router){
        $rootScope.setTitle("Eko Biashara | Forgot Password");
        $scope.email = null;
        $scope.recover = function(event){
            var wait = $alert.wait("Please wait...", event);
            $appAPI.tQuery({forgot_password_email : $scope.email}, {
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