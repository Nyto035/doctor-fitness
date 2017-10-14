(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(6, "dvr", "Sales List", "dashboard.business.business_sales_list");
        $sessionProvider.addProtectedState("dashboard.business.business_sales_list");
        $stateProvider.state("dashboard.business.business_sales_list", {
            url: "/sales-list",
            templateUrl: "res/business_sales/business_sales_list.html",
            controller: business_sales_listCtrl
        });
    }]);
    function business_sales_listCtrl($rootScope, $scope, $stateParams, $appAPI, $alert){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.sales_list = $rootScope.hasOwnProperty("sales_list") ? $rootScope.sales_list : [];
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        $scope.fetchItems($rootScope, "business_cash_accounts", null, {get_business_payment_accounts : $rootScope.businessId});
        $scope.fetchSalesList = function(){
            var isLoaded = $rootScope.hasOwnProperty("sales_list") && $rootScope.sales_list.length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            var request = {
                get_business_sales_list : $rootScope.businessId,
                page : 0,
                limit : 100
            };
            $appAPI.tQuery(request, {
                success : function(data){
                    console.log("sales list data", data);
                    if (objectHasKeys(data) && data.hasOwnProperty("page_data") && isArray(data.page_data)){
                        var sales_list = data.page_data;
                        console.log("sales list", sales_list);
                        if (isLoaded) objectUpdate($rootScope.sales_list, sales_list);
                        else $rootScope.sales_list = sales_list;
                        $rootScope.reapply();
                    }
                },
                error : function(error, xhr){
                    console.error("Error fetching sales list", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };
        $scope.showPrint = function(event, journal_id, type){
            var wait = $alert.wait("Fetching " + type.toLowerCase() + " details...");
            var doPrintElement = function(printElement, event){
                $scope.documentPrintModal(event, type, printElement);
                /*
                var printSuccess = PrintElement(camelCase(type), printElement, false);
                if (!printSuccess){
                    $alert.warning("Error Printing", "Your browser may have disabled popups. Please enable this to avoid further inconveniences", event);
                }
                */
            };
            $appAPI.tQuery({get_sale_transaction_document : journal_id},{
                success : function(data){
                    if (type === "ETR"){
                        $scope.makeETRPrintElement(camelCase("Receipt"), data, function(printElement){
                            wait.hide();
                            doPrintElement(printElement);
                        });
                    }
                    else {
                        var business_logo = $rootScope.hasOwnProperty("business") && "object" === typeof $rootScope.business && $rootScope.business.hasOwnProperty("logo") && !emptyString($rootScope.business.logo) ? $rootScope.business.logo : "";
                        $scope.makePrintElement(type, business_logo, data, function(printElement){
                            wait.hide();
                            doPrintElement(printElement);
                        });
                    }
                },
                error : function(error){
                    wait.hide();
                    $alert.warning("Error fetching document", error);
                }
            });
        };
        $scope.collectPayment = function(pos, event){
            if ($rootScope.hasOwnProperty("sales_list") && isArray($rootScope.sales_list) && !isNaN(pos) && pos < $rootScope.sales_list.length){
                var _item = $rootScope.sales_list[pos];
                if (objectHasKeys(_item) && _item.hasOwnProperty("id") && _item.hasOwnProperty("customer_names") && _item.hasOwnProperty("amount_due")){
                    $scope.collectPaymentModal(event, "Collect Payment from " + _item.customer_names, "Pay Into", $rootScope.businessId, _item.id, _item.amount_due, $rootScope.business_cash_accounts, $scope.fetchSalesList);
                }
            }
        };
        //self init
        $scope.fetchSalesList();
    }
})();