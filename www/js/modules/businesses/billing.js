
(function() {

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider){
        $sessionProvider.addProtectedState("dashboard.billing");
        $stateProvider.state("dashboard.billing", {
            url: "/billing/:businessId?pesapal_transaction_tracking_id&pesapal_merchant_reference",
            templateUrl: "res/businesses/billing.html",
            controller: billingCtrl
        });
    }]);

    function billingCtrl($rootScope, $scope, $alert, $appAPI, $stateParams, $router, $businessLinks, $mdDialog, $mdMedia, $session){
		
		$rootScope.businessId = $stateParams.businessId;
		$scope.trackingId = $stateParams.pesapal_transaction_tracking_id;
		$scope.reference = $stateParams.pesapal_merchant_reference;
		$scope.complete = false;
		$scope.transaction_status = "ERROR";
		$scope.verifying = "string" === typeof $scope.trackingId && $scope.reference == $rootScope.businessId;
		
		$scope.setDashboardTitle("Business Billing");
        $scope.setSideNavLinks([
            {
                icon : "business",
                name : "My Businesses",
                separator : false,
                stateRef : "dashboard.businesses"
            }
        ], true);
		$scope.setBusiness = function(){
            $scope.setDashboardTitle($rootScope.business.name);
            $scope.setSideNavLogo($rootScope.business.logo);
            $scope.setDashLoading(false);
        };
        if ($rootScope.hasOwnProperty("business") && objectHasKeys($rootScope.business)){
            $scope.setBusiness();
        }
		$scope.refreshBusinessDetails = function(){
            var isLoaded = $rootScope.hasOwnProperty("business") && objectHasKeys($rootScope.business);
            if (!isLoaded) $scope.setDashLoading(true);
            //-clear business data
            $rootScope.business_customers = [];
            $rootScope.business_outputs = [];
            $rootScope.tax_statuses = [];
            $rootScope.business_taxes = [];
            $rootScope.business_cash_accounts = [];
            //-/clear business data
            $appAPI.tQuery({get_business_details : $rootScope.businessId}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.business, data);
                    else $rootScope.business = data;
                    $rootScope.$broadcast("root-business-updated");
                    $rootScope.reapply();
                    $scope.setBusiness();
                    if (!$scope.verifying && !$scope.billBusiness($rootScope.business)) $router.go("dashboard.business", {businessId : $rootScope.business.id}); 
                },
                error : function(error, xhr){
                    $alert.warning(null, error);                    
                    console.error("Business details fetch error: ", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };
		
		if ($scope.verifying){
			$appAPI.tQuery({pesapal_verify : $scope.reference, tracking_id : $scope.trackingId}, {
				success : function(data){
					$scope.transaction_status = camelCase(data);
					$scope.complete = true;
					$scope.reapply();
				},
				error : function(error){
					$router.go("dashboard.billing", {businessId : $rootScope.businessId, pesapal_transaction_tracking_id : "", pesapal_merchant_reference : ""});
					$alert.warning("Payment Verification Error", error);					
				}
			});
		}
		
		$scope.openThisBusiness = function(){
			$router.go("dashboard.business", {businessId : $rootScope.business.id});
		};
		
		$scope.createForm = function(){
			var names = $rootScope.session.names;
			var email = $rootScope.session.email;
			var phone = $rootScope.session.phone;
			var namesArr = names.split(" ");
			var firstName = lastName = "";
			for (var i=0; i < namesArr.length; i++){
				if (i < 1) firstName = namesArr[i];
				else lastName += lastName.trim().length > 0 ? " " + namesArr[i] : namesArr[i];
			}
			pesapal.init({
				server : $session.settings.serverURL,
				container : "#eko_billing_form",
				inputNames : true,
				inputEmail : true,
				namesRequired : false,
				phoneRequired : true,
				emailRequired : true,
				checkoutButtonHTML : "<md-icon class='material-icons'>payment</md-icon> Checkout",
				checkoutButtonClassName : "md-button md-primary md-raised eko-billing-checkout-button",
				setFirstName : firstName,
				setLastName : lastName,
				setEmail : email,
				setPhone : phone,
                setPesapalFrameParam : function(){
					return $rootScope.businessId;
				}
			});		
		};
		
		//self init
		$scope.refreshBusinessDetails();
		$scope.createForm();
	}
})();