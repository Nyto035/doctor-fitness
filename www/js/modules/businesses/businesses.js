(function() {

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider){
        $sessionProvider.addProtectedState("dashboard.businesses");
        $stateProvider.state("dashboard.businesses", {
            url: "/businesses",
            templateUrl: "res/businesses/businesses.html",
            controller: businessesCtrl
        });
    }]);

    function businessesCtrl($rootScope, $scope, $router, $appAPI, $alert){
        $scope.setDashboardTitle("My Businesses");
        $scope.setSideNavLinks([
            {
                icon : "business",
                name : "My Businesses",
                separator : false,
                stateRef : "dashboard.businesses"
            },
            {
                icon : "add",
                name : "Add New Business",
                separator : false,
                stateRef : "dashboard.new_business"
            }
        ].concat($rootScope.session.back ? [{
            icon : "data_usage",
            name : "Simple Backend",
            separator : false,
            stateRef : "dashboard.backend"
        }] : []), true);
        $scope.setDashLoading(false);
        $scope.setSideNavLogo("res/images/bgimage.jpg");
        $rootScope.businesses = $rootScope.hasOwnProperty("businesses") ? $rootScope.businesses : [];
        $scope.loadBusinesses = function(){
            var isLoaded = $rootScope.hasOwnProperty("businesses") && $rootScope.businesses.length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            $appAPI.tQuery({get_user_businesses : 1}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.businesses, data);
                    else $rootScope.businesses = data;
                    $rootScope.reapply();
                },
                error : function(error, xhr){
                    console.error("Fetching businesses error: ", error, xhr);
                    $alert.warning("Fetching businesses failed", error);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };
        $scope.openBusiness = function(pos){
			$rootScope.business = $rootScope.businesses[pos];
			if (!$scope.billBusiness($rootScope.business)) $router.go("dashboard.business", {businessId : $rootScope.business.id});           
        };
        //self init
        $scope.loadBusinesses();
		
    }

})();