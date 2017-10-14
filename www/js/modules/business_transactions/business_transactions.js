(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(5, "compare_arrows", "Internal Transactions", "dashboard.business.business_transactions");
        $businessLinksProvider.addToLeftMenu(10, "compare_arrows", "Internal Transactions", "dashboard.business.business_transactions");
        $sessionProvider.addProtectedState("dashboard.business.business_transactions");
        $stateProvider.state("dashboard.business.business_transactions", {
            url: "/internal-transactions",
            templateUrl: "res/business_transactions/business_transactions.html",
            controller: business_transactionsCtrl
        });
    }]);
    function business_transactionsCtrl($rootScope, $scope, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        $scope.fetchItems($rootScope, "business_cash_accounts", null, { get_business_cash_accounts : $rootScope.businessId}, function(data){ console.log("cash acc", data); });
        $scope.cashAccountsOptions = function(){
            var options = [];
            if ($rootScope.hasOwnProperty("business_cash_accounts") && isArray($rootScope.business_cash_accounts)){
                for (var i = 0; i < $rootScope.business_cash_accounts.length; i++){
                    var _account = $rootScope.business_cash_accounts[i];
                    options.push({
                        id : _account.id,
                        name : _account.account_provider + " " + _account.account_holder + " " + _account.account_number
                    });
                }
            }
            return options.reverse();
        };

        //other revenues
        $rootScope.business_other_revenues = $rootScope.hasOwnProperty("business_other_revenues") ? $rootScope.business_other_revenues : [];
        $scope.fetchBusinessOtherRevenues = function(){
            $scope.fetchItems($rootScope, "business_other_revenues", "page_data", {get_business_other_revenues_list : $rootScope.businessId});
        };
        $scope.newRevenue = function(event){
            var businessId = $rootScope.businessId;
            var cash_account = null;
            var cash_accounts = $scope.cashAccountsOptions();
            if (cash_accounts.length > 0) cash_account = cash_accounts[0].id;
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cash_accounts = cash_accounts;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = {
                        business_other_revenue : businessId,
                        revenue_source_name : null,
                        transaction_date : new Date(),
                        payment_account_id : cash_account,
                        amount : null,
                        notes : null
                    };
                    $scope.saveEdit = function(event){
                        var saveDetails = freeObj($scope.edit);
                        saveDetails.transaction_date = $scope.edit.transaction_date.format("dd/MM/yyyy");
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(saveDetails, {
                            success: function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error: function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business_transactions/new_revenues.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(function(){
                $scope.fetchBusinessOtherRevenues();
            });
        };

        //inject capital
        $rootScope.business_injected_capital = $rootScope.hasOwnProperty("business_injected_capital") ? $rootScope.business_injected_capital : [];
        $scope.fetchInjectedCapital = function(){
            $scope.fetchItems($rootScope, "business_injected_capital", "page_data", {get_business_capital_injection_list : $rootScope.businessId});
        };
        $scope.injectCapital = function(event){
            var businessId = $rootScope.businessId;
            var cash_account = null;
            var cash_accounts = $scope.cashAccountsOptions();
            if (cash_accounts.length > 0) cash_account = cash_accounts[0].id;
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cash_accounts = cash_accounts;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = {
                        business_inject_capital : businessId,
                        capital_source_name : null,
                        transaction_date : new Date(),
                        payment_account_id : cash_account,
                        amount : null,
                        notes : null
                    };
                    $scope.saveEdit = function(event){
                        var saveDetails = freeObj($scope.edit);
                        saveDetails.transaction_date = $scope.edit.transaction_date.format("dd/MM/yyyy");
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(saveDetails, {
                            success: function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error: function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business_transactions/inject_capital.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(function(){
                $scope.fetchInjectedCapital();
            });
        };

        //inter account transfer
        $rootScope.business_interaccount_transfers = $rootScope.hasOwnProperty("business_interaccount_transfers") ? $rootScope.business_interaccount_transfers : [];
        $scope.fetchInterAccountTransfers = function(){
            $scope.fetchItems($rootScope, "business_interaccount_transfers", "page_data", {get_business_inter_account_transfer_list : $rootScope.businessId});
        };
        $scope.interAccountTransfer = function(event){
            var businessId = $rootScope.businessId;
            var cash_account = null;
            var cash_accounts = $scope.cashAccountsOptions();
            if (cash_accounts.length > 0) cash_account = cash_accounts[0].id;
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cash_accounts = cash_accounts;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = {
                        business_inter_account_transfer : businessId,
                        transaction_date : new Date(),
                        account_from_id : cash_account,
                        account_to_id : cash_account,
                        amount : null,
                        reason : null
                    };
                    $scope.saveEdit = function(event){
                        var saveDetails = freeObj($scope.edit);
                        saveDetails.transaction_date = $scope.edit.transaction_date.format("dd/MM/yyyy");
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(saveDetails, {
                            success: function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error: function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business_transactions/inter_account_transfers.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(function(){
                $scope.fetchInterAccountTransfers();
            });
        };

        //drawings and dividends
        $rootScope.business_drawings = $rootScope.hasOwnProperty("business_drawings") ? $rootScope.business_drawings : [];
        $scope.fetchBusinessDrawings = function(){
            $scope.fetchItems($rootScope, "business_drawings", "page_data", {get_business_drawings_list : $rootScope.businessId});
        };
        $scope.newBusinessDrawing = function(event){
            var businessId = $rootScope.businessId;
            var cash_account = null;
            var cash_accounts = $scope.cashAccountsOptions();
            if (cash_accounts.length > 0) cash_account = cash_accounts[0].id;
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cash_accounts = cash_accounts;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = {
                        business_drawings : businessId,
                        beneficiary_name : null,
                        transaction_date : new Date(),
                        source_account_id : cash_account,
                        amount : null,
                        reason : null
                    };
                    $scope.saveEdit = function(event){
                        var saveDetails = freeObj($scope.edit);
                        saveDetails.transaction_date = $scope.edit.transaction_date.format("dd/MM/yyyy");
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(saveDetails, {
                            success: function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error: function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business_transactions/business_drawing.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(function(){
                $scope.fetchBusinessDrawings();
            });
        };

        //init
        $scope.fetchBusinessOtherRevenues();
        $scope.fetchInjectedCapital();
        $scope.fetchInterAccountTransfers();
        $scope.fetchBusinessDrawings();
    }
})();