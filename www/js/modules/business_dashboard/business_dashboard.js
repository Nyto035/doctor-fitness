(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToLeftMenu(1, "dashboard", "Dashboard", "dashboard.business.business_dashboard");
        $sessionProvider.addProtectedState("dashboard.business.business_dashboard");
        $stateProvider.state("dashboard.business.business_dashboard", {
            url: "/dashboard",
            templateUrl: "res/business_dashboard/business_dashboard_construction.html",
            templateUrl: "res/business_dashboard/business_dashboard.html",
            controller: business_dashboardCtrl
        });
    }]);
    function business_dashboardCtrl($scope, $rootScope, $appAPI, $alert, $stateParams, $businessLinks){
		$rootScope.businessId = $stateParams.businessId;
                $scope.shortcuts = $businessLinks.dashboard_links;
		$scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                $scope.monthText = function(){
                    var today = new Date();
                    return $scope.months[today.getMonth()] + " " + today.getFullYear();
                };
                $scope.data = {};
		var wait = $alert.wait("Fetching dashboard data...");
		var details = {
			get_dash_stats : $rootScope.businessId
		};
		$scope.revenue_totals = 0;
		$scope.net_revenue = 0;
		$scope.costs = 0;
		$scope.expenses = 0;
		$scope.profit = 0;
		$appAPI.tQuery(details, {
			success: function(data){
				if ("object" === typeof data && data.hasOwnProperty("categories")){
					var categories = data.categories;
					if (categories.length == 2){
						$scope.net_revenue = categories[0].groups[0].totals;
						$scope.revenue_totals = categories[0].totals;
						$scope.costs = categories[0].groups[1].totals;
						$scope.expenses = categories[1].groups[0].totals;
						$scope.profit = categories[1].totals;
					}
				}
			},
			error: function(error){
				$alert.warning("Fetch Error!", error, event);
			},
			then : function(){
				wait.hide();
			}
		});
    }
})();
