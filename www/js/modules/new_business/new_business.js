(function() {

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider) {
        $sessionProvider.addProtectedState("dashboard.new_business");
        $stateProvider.state("dashboard.new_business", {
            url: "/new-business",
            templateUrl: "res/new_business/new_business.html",
            controller: new_businessCtrl
        });
    }]);

    function new_businessCtrl($rootScope, $scope, $state, $router, $appAPI, $alert){
        $scope.setDashboardTitle("New Business");
        $scope.setSideNavLinks([
            {
                icon : "business",
                name : "My Businesses",
                separator : false,
                stateRef : "dashboard.businesses"
            }
        ], true);
        $scope.setDashLoading(false);
        $scope.setSideNavLogo("res/images/bgimage.jpg");
        $scope.edit = {
            name : "",
            plan : 1,
            currency : 69,
            address : "",
            postal : "",
            phones : "",
            emails : "",
            agent : ""
        };
        $scope.saveEdit = function(event){
            var errors = [];
            if (emptyString($scope.edit.name)) errors.push("Please enter your business name");
            if (isNaN($scope.edit.plan)) errors.push("Please select a business plan");
            if (isNaN($scope.edit.currency)) errors.push("Please select main currency");
            if (errors.length > 0){
                $alert.warning("Entries Error", errors.join("<br>"), event);
                errors = null;
            }
            else {
                var details = {};
                details.new_business = $scope.edit.name;
                details.plan = $scope.edit.plan;
                details.pin = $scope.edit.pin;
                details.currency_id = $scope.edit.currency;
                details.logo = "";
                details.slogan = "";
                details.receipt_footnote = "";
                details.invoice_footnote = "";
                details.quotation_footnote = "";
                details.main_branch_name = "Main";
                details.physical_address = $scope.edit.address;
                details.postal_address = $scope.edit.postal;
                details.phones = $scope.edit.phones.split(",");
                details.emails = $scope.edit.emails.split(",");
                details.agent = $scope.edit.agent;
                var wait = $alert.wait("Saving new business...", event);
                $appAPI.tQuery(details, {
                    success : function(data){
			wait.hide();
                        var newBusiness = {
                            id : data,
                            isOwner : true,
                            logo : "",
                            name : $scope.edit.name,
                            slogan : "New business"
                        };
                        //if ($rootScope.hasOwnProperty("businesses")) $rootScope.push(newBusiness);
                        //else $rootScope.businesses = [newBusiness];
                        $state.go("dashboard.businesses");
                    },
                    error : function(error){
						wait.hide();
                        $alert.warning("Business Save Error", error, event);
                    }
                });
            }
        };
        $rootScope.pricing = $rootScope.hasOwnProperty("pricing") ? $rootScope.pricing : [];
        $rootScope.currencies = $rootScope.hasOwnProperty("currencies") ? $rootScope.currencies : [];
        $scope.fetchPricing = function(){
            var isLoaded = $rootScope.hasOwnProperty("pricing") && $rootScope.pricing.length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            $appAPI.query({get_plans : 1}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.pricing, data);
                    else $rootScope.pricing = data;
                    $rootScope.reapply();
                },
                error : function(error, xhr){
                    $alert.warning("Error fetching plans", error);
                    console.error("Pricing details fetch error: ", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };
        $scope.fetchCurrencies = function(){
            var isLoaded = $rootScope.hasOwnProperty("currencies") && $rootScope.currencies.length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            $appAPI.tQuery({get_currencies : 1}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.currencies);
                    else $rootScope.currencies = data;
                    $rootScope.reapply();
                },
                error : function(error, xhr){
                    $alert.warning("Error fetching currencies", error);
                    console.error("Pricing details fetch error: ", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };

        //self init
        $scope.fetchPricing();
        $scope.fetchCurrencies();
    }

})();