(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function($stateProvider, $sessionProvider){
        $sessionProvider.addProtectedState("dashboard.backend");
        $stateProvider.state("dashboard.backend", {
            url: "/backend",
            templateUrl: "res/backend/backend.html",
            controller: backendCtrl
        });
    }]);

    function backendCtrl($rootScope, $scope, $appAPI, $alert){
        $scope.setDashLoading(true);
        $scope.setDashboardTitle("Simple Backend");
        $scope.setSideNavLogo("res/images/bgimage.jpg");
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
        ], true);
        $rootScope.back_users = $rootScope.hasOwnProperty("back_users") ? $rootScope.back_users : [];
        $rootScope.back_agents = $rootScope.hasOwnProperty("back_agents") ? $rootScope.back_agents : [];
        $rootScope.back_businesses = $rootScope.hasOwnProperty("back_businesses") ? $rootScope.back_businesses : [];
		$scope.billing_toggle = false;
		$scope.toggle_billing = function(){
			for (var i = 0; i < $rootScope.back_businesses.length; i++){
				$rootScope.back_businesses[i].billing = $scope.billing_toggle;
			}
			$scope.reapply();
		};
		$scope.saveBilling = function(event){
			var billing_data = {};
			for (var i = 0; i < $rootScope.back_businesses.length; i++){
				billing_data[$rootScope.back_businesses[i].id] = $rootScope.back_businesses[i].billing ? 1 : 0;
			}
			var wait = $alert.wait("Please wait...", event);
			$appAPI.tQuery({dash_business_billing : billing_data}, {
				success : function(data){
					wait.hide();
					$alert.success("Saving Success!", data, event);
				},
				error : function(error){
					wait.hide();
					$alert.warning("Saving Error!", error, event);
				}
			});
		};
        $scope.fetchBackUsers = function(event){
            $scope.setDashLoading(true);
            $appAPI.tQuery({dash_get_users : 1}, {
                success : function(data){
                    $rootScope.back_users = data;
                },
                error : function(error){
                    $alert.warning("Error Fetching Users", error, event);
                },
                then : function(){
                    $scope.setDashLoading(false);
                }
            });
        };
        $scope.fetchBackAgents = function(event){
            $scope.setDashLoading(true);
            $appAPI.tQuery({dash_get_agents : 1}, {
                success : function(data){
                    $rootScope.back_agents = data;
                },
                error : function(error){
                    $alert.warning("Error Fetching Agents", error, event);
                },
                then : function(){
                    $scope.setDashLoading(false);
                }
            });
        };
        $scope.fetchBackBusinesses = function(event){
            $scope.setDashLoading(true);
            $appAPI.tQuery({dash_get_user_businesses : 1}, {
                success : function(data){
                    $rootScope.back_businesses = data;
                },
                error : function(error){
                    $alert.warning("Error Fetching Businesses", error, event);
                },
                then : function(){
                    $scope.setDashLoading(false);
                }
            });
        };
        $scope.activateUser = function(pos, event){
            var userid = $rootScope.back_users[pos].id;
            var wait = $alert.wait("Activating user...", event);
            $appAPI.tQuery({dash_activate_user : userid}, {
                success : function(){
                    $rootScope.back_users[pos].status = "ACTIVE";
                    $alert.success("User Activated!", "The user has been activated successfully!");
                },
                error : function(error){
                    $alert.warning("Error Activating User", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.fetchBackUsers();
        $scope.fetchBackAgents();
        $scope.fetchBackBusinesses();
    }

})();