(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.lock", {
            url: "/locked",
            templateUrl: "res/auth/auth_lock.html",
            controller: authLockCtrl
        });
    }]);

    function authLockCtrl($rootScope, $scope, $alert, $appAPI, $router, $session){
        $rootScope.setTitle("Eko Biashara | Session Locked");
        $scope.password = null;
        $scope.lockedUser = "none";
        $scope.getLockedUser = function(){
            $appAPI.tQuery({get_locked_user : 1}, {
                success : function(data){
                    console.log("lockedUser", data);
                    $scope.lockedUser = data;
                },
                error : function(error){
                    console.error("Error getting locked user", error);
                }
            });
        };
        $scope.unlock = function(event){
            var wait = $alert.wait("Please wait...", event);
            $appAPI.tQuery({unlock_session : $scope.password}, {
                success : function(data){
                    $router.go($session.settings.sessionState, $session.settings.sessionStateParams);
                    $alert.success("Session Unlocked", data, event);
                },
                error : function(error){
                    $alert.warning("Unlock Error", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.getLockedUser();
    }

})();