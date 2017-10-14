(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("auth", {
            url: "/auth",
            templateUrl: "res/auth/auth.html",
            controller: authCtrl
        });
    }]);

    function authCtrl($rootScope){
        $rootScope.isMainLoading = false;
    }

})();