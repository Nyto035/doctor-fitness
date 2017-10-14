(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToLeftMenu(5, "local_atm", "Expenses", "dashboard.business.business_expenses");
        $sessionProvider.addProtectedState("dashboard.business.business_expenses");
        $stateProvider.state("dashboard.business.business_expenses", {
            url: "/expenses",
            templateUrl: "res/business_expenses/business_expenses.html",
            controller: business_expensesCtrl
        });
    }]);
    function business_expensesCtrl($rootScope, $scope, $appAPI, $alert, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        $rootScope.business_expenses = $rootScope.hasOwnProperty("business_expenses") ? $rootScope.business_expenses : [];
        $scope.fetchItems($rootScope, "business_cash_accounts", null, { get_business_cash_accounts : $rootScope.businessId});
        $scope.fetchExpenses = function(){
            $scope.fetchItems($rootScope, "business_expenses", "page_data", {get_business_expenses_list : $rootScope.businessId, type : 1});
        };
        $scope.fetchExpenses();
        $scope.newExpense = function(event){
            $scope.editModal(event, function(){
                $alert.success("Expense Added!", "Expense transaction has been recorded successfully", event);
                $scope.fetchExpenses();
            });
        };
        $scope.editModal = function(event, onSuccess, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert){
                    $scope.cashAccounts = $rootScope.business_cash_accounts;
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
                        business_expense : $rootScope.businessId,
                        expense_type : 1,
                        expense_name : null,
                        transaction_date : new Date(),
                        payment_account_id : isArray($scope.cashAccounts) && $scope.cashAccounts[0].hasOwnProperty("id") ? $scope.cashAccounts[0].id : null,
                        amount : null,
                        notes : null
                    };
                    $scope.saveEdit = function(event){
                        var request = {
                            business_expense : $scope.edit.business_expense,
                            expense_type : $scope.edit.expense_type,
                            expense_name : $scope.edit.expense_name,
                            transaction_date : $scope.edit.transaction_date.format("dd/MM/yyyy"),
                            payment_account_id : $scope.edit.payment_account_id,
                            amount : toNumber($scope.edit.amount, 0),
                            notes : $scope.edit.notes
                        };
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error, xhr){
                                wait.hide();
                                console.error("Error saving details", error, xhr);
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business_expenses/business_expenses_edit.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };
    }
})();