(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth.agents", {
            url: "/agents/:joinReference",
            templateUrl: "res/auth/agents.html",
            controller: agentsCtrl
        });
    }]);

    function agentsCtrl($rootScope, $scope, $stateParams, $alert, $appAPI, $router){
        $rootScope.isMainLoading = false;
        $rootScope.setTitle("Eko Biashara | Agents Registration");
        $scope.edit_temp = {
            agent_registration : $stateParams.joinReference,
            names : null,
            phone : null,
            email : null,
            region : null,
            group : null
        };
        $scope.edit = freeObj($scope.edit_temp);
        $scope.saveDetails = function(event){
            var wait = $alert.wait("Please wait...", event);
            $appAPI.tQuery($scope.edit, {
                success : function(data){
                    $alert.success("Agent Registered!", data, event);
                    $router.go("home");
                },
                error : function(error){
                    $alert.warning("Saving Failed!", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        }
    }

})();