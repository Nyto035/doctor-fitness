(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(4, "account_balance_wallet", "Business Accounts", "dashboard.business.business_accounts");
        $businessLinksProvider.addToLeftMenu(9, "account_balance_wallet", "Accounting", "dashboard.business.business_accounts");
        $sessionProvider.addProtectedState("dashboard.business.business_accounts");
        $stateProvider.state("dashboard.business.business_accounts", {
            url: "/accounts",
            templateUrl: "res/business_accounts/business_accounts.html",
            controller: business_accountsCtrl
        });
    }]);
    function business_accountsCtrl($rootScope, $scope, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.account_groups = $rootScope.hasOwnProperty("account_groups") ? $rootScope.account_groups : [];
        $scope.fetchAccountGroups = function(){
            $scope.fetchItems($rootScope, "account_groups", "page_data", {get_business_account_groups : $rootScope.businessId});
        };

        $rootScope.business_accounts = $rootScope.hasOwnProperty("business_accounts") ? $rootScope.business_accounts : [];
        $scope.fetchBusinessAccounts = function(){
            $scope.fetchItems($rootScope, "business_accounts", "page_data", {get_business_accounts : $rootScope.businessId});
        };

        $rootScope.audit_business_transactions = $rootScope.hasOwnProperty("audit_business_transactions") ? $rootScope.audit_business_transactions : [];
        $scope.fetchAuditTransactions = function(){
            $scope.fetchItems($rootScope, "audit_business_transactions", "page_data", {get_business_transactions_audit : $rootScope.businessId}, function(data){ console.log("audit_data", data); });
        };

        $scope.viewDetails = function(pos, event){
            if ($rootScope.hasOwnProperty("audit_business_transactions") && isArray($rootScope.audit_business_transactions) && !isNaN(pos) && pos < $rootScope.audit_business_transactions.length){
                var item = $rootScope.audit_business_transactions[pos];
                $mdDialog.show({
                    controller: function($scope, $alert, $mdDialog){
                        $scope.details = item;
                        $scope.hide = function(){
                            $mdDialog.hide();
                        };
                        $scope.cancel = function(){
                            $mdDialog.cancel();
                        };
                    },
                    templateUrl: "res/business_accounts/audit_transaction_details.html",
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:false,
                    fullscreen: $mdMedia("xs")
                });
            }
        }; //audit_transaction_details.html

        //self init
        $scope.fetchAccountGroups();
        $scope.fetchBusinessAccounts();
        $scope.fetchAuditTransactions();
    }
})();