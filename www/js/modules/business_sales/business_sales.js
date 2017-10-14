(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$mdDateLocaleProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $mdDateLocaleProvider, $businessLinksProvider) {
        $businessLinksProvider.addToLeftMenu(3, "add_shopping_cart", "Sales", "dashboard.business.business_sales", true);
        $sessionProvider.addProtectedState("dashboard.business.business_sales");
        $stateProvider.state("dashboard.business.business_sales", {
            url: "/sales?tab",
            templateUrl: "res/business_sales/business_sales2.html",
            controller: business_salesCtrl
        });
        $mdDateLocaleProvider.formatDate = function(date){
            var day = date.getDate();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();
            return day + '/' + (monthIndex + 1) + '/' + year;
        };
    }]);
    function business_salesCtrl($rootScope, $scope, $state, $stateParams, $alert, $appAPI, $mdMedia, $mdDialog, $filter){
        $rootScope.businessId = $stateParams.businessId;
        $scope.selected_tab = $stateParams.tab || 0;
        $scope.sale_customer = null;
        $scope.sale_query = null;
        $rootScope.business_customers = $rootScope.hasOwnProperty("business_customers") ? $rootScope.business_customers : [];
        $rootScope.business_outputs = $rootScope.hasOwnProperty("business_outputs") ? $rootScope.business_outputs : [];
        $rootScope.tax_statuses = $rootScope.hasOwnProperty("tax_statuses") ? $rootScope.tax_statuses : [];
        $rootScope.business_taxes = $rootScope.hasOwnProperty("business_taxes") ? $rootScope.business_taxes : [];
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];

        //self init items
        $scope.fetchItems($rootScope, "business_customers", "page_data", {get_business_customers : $rootScope.businessId}, function(){
            if ($rootScope.hasOwnProperty("business_customers") && isArray($rootScope.business_customers)){
                var cn = $rootScope.business_customers.length;
                if (cn > 0) $scope.sale_customer = $rootScope.business_customers[cn - 1];
            }
        });
        $scope.fetchItems($rootScope, "business_outputs", null, {get_sale_items : $rootScope.businessId});
        $scope.fetchItems($rootScope, "tax_statuses", null, {get_tax_statuses : $rootScope.businessId});
        $scope.fetchItems($rootScope, "business_taxes", null, {get_business_taxes : $rootScope.businessId});
        $scope.fetchItems($rootScope, "business_cash_accounts", null, {get_business_payment_accounts : $rootScope.businessId});

        //search auto complete - customers
        $scope.searchCustomer = function(){
            return $filter('filter')($rootScope.business_customers, $scope.sale_query);
        };
        $scope.searchCustomerQueryChange = function(text){
            $scope.saleCustomerChange(text);
        };
        $scope.saleCustomerChange = function(item){
            $scope.sale_customer = item;
            $scope.reapply();
        };
        $scope.resetSearchCustomer = function(){
            $scope.sale_query = null;
            $scope.sale_customer = null;
            if (isArray($rootScope.business_customers) && $rootScope.business_customers.length > 0){
                $scope.sale_customer = $rootScope.business_customers[0];
            }
            $scope.reapply();
        };

        //search auto complete - outputs
        $scope.sale_output_item = null;
        $scope.sale_output_query = null;
        $scope.saleOutputQueryTextChange = function(text){
            $scope.saleOutputItemChange(text);
        };
        $scope.saleOutputItemChange = function(item){
            $scope.sale_output_item = item;
            $scope.setOutputItem();
        };
        $scope.setOutputItem = function(){
            if (objectHasKeys($scope.sale_output_item)){
                $scope.item.id = $scope.sale_output_item.id;
                $scope.item.name = $scope.sale_output_item.name;
                $scope.item.price = $scope.sale_output_item.selling_price;
                $scope.item.tax_id = $scope.sale_output_item.taxid;
                $scope.item.tax_status = $scope.sale_output_item.taxstatus;
                $scope.item.qty = 1;
                $scope.item.tax_rate = 0;
                $scope.item.tax_amount = 0;
                $scope.item.tax_name = null;
                $scope.item.discount = null;
                if (!emptyString($scope.item.tax_id)){
                    var tax_item = $scope.getBusinessTax($scope.item.tax_id);
                    if (objectHasKeys(tax_item)){
                        if (!emptyString(tax_item.name) && tax_item.name == "VAT") tax_item.rate = 16;
                        $scope.item.tax_rate = tax_item.rate;
                        $scope.item.tax_name = tax_item.name;
                    }
                }
            }
            else {
                $scope.item.id = null;
                $scope.item.name = $scope.sale_output_query;
                $scope.item.price = 0;
                $scope.item.tax_id = null;
                $scope.item.tax_status = 1;
                $scope.item.qty = 1;
                $scope.item.tax_rate = 0;
                $scope.item.tax_amount = 0;
                $scope.item.tax_name = null;
                $scope.item.discount = null;
            }
        };
        $scope.searchSaleOutputItem = function(){
            return $filter('filter')($rootScope.business_outputs, $scope.sale_output_query);
        };
        $scope.resetSaleSearch = function(){
            $scope.sale_output_item = null;
            $scope.sale_output_query = null;
        };

        //processing routines...
        $scope.getBusinessTax = function(id){
            if (!emptyString(id) && $rootScope.hasOwnProperty("business_taxes") && $rootScope.business_taxes.length > 0){
                for (var i = 0; i < $rootScope.business_taxes.length; i ++){
                    var tax_item = $rootScope.business_taxes[i];
                    if (objectHasKeys(tax_item) && tax_item.hasOwnProperty("id") && tax_item.id.trim() == id.trim()){
                        return tax_item;
                    }
                }
            }
            return null;
        };
        $scope.transaction_date = new Date();
        $scope.items = [];
        $scope.items_total = 0;
        $scope.item = {
            id : null,
            name : null,
            price : null,
            qty : null,
            tax_amount : null,
            tax_id : null,
            tax_rate : null,
            tax_name : null,
            tax_status : null,
            discount : null,
            total : null
        };
        $scope.resetItem = function(){
            $scope.item = {
                id : null,
                name : null,
                price : null,
                qty : null,
                tax_amount : null,
                tax_id : null,
                tax_rate : null,
                tax_name : null,
                tax_status : null,
                discount : null,
                total : null
            };
        };
        $scope.itemCalc = function(){
            var price_total = $scope.item.qty * $scope.item.price;
            var discount = toNumber($scope.item.discount, 0);
            var sub_total = price_total - discount;
            var tax_amount = calcTax(sub_total, $scope.item.tax_rate, $scope.item.tax_status);
            var total = sub_total;
            if ($scope.item.tax_status == 3) total += tax_amount;
            $scope.item.tax_amount = tax_amount;
            $scope.item.total = total;
            $scope.reapply();
        };
        $scope.$watch("item", function(){ $scope.itemCalc(); }, true);
        $scope.itemAdd = function(){
            var item = freeObj($scope.item);
            if (!emptyString(item.name)){
                $scope.items.push(item);
                $scope.itemsCalc();
                $scope.resetSaleSearch();
                $scope.resetItem();
                $scope.reapply();
            }
        };
        $scope.itemsCalc = function(){
            var _items_totals = 0;
            for (var i = 0; i < $scope.items.length; i ++){
                var _item = $scope.items[i];
                if (_item.hasOwnProperty("total")) _items_totals += _item.total;
            }
            $scope.items_total = _items_totals;
        };
        $scope.itemDelete = function(pos){
            if (!isNaN(pos) && pos < $scope.items.length){
                $scope.items.splice(pos, 1);
                $scope.itemsCalc();
                $scope.reapply();
            }
        };
        $scope.processSale = function(event){
            $scope.itemAdd();
            if ($scope.items.length < 1){
                $alert.toast("Please add items for this transaction", 2000, "bottom right");
                return;
            }
            var process_total = $scope.items_total;
            var cash_accounts = $rootScope.business_cash_accounts;
            var client_name = objectHasKeys($scope.sale_customer) ? $scope.sale_customer.name : $scope.sale_customer;
            if (typeof client_name === "undefined" || client_name === "" || client_name === null){
                client_name = "";
            }
            var transaction_details = {
                business_sale : $rootScope.businessId,
                client_id : objectHasKeys($scope.sale_customer) ? $scope.sale_customer.id : "",
                client_name : client_name,
                transaction_date : $scope.transaction_date.format("dd/MM/yyyy"),
                items : freeObj($scope.items),
                branch_id : ""
            };
            $mdDialog.show({
                controller: function($scope, $alert, $mdDialog){
                    $scope.process_total = process_total;
                    $scope.cash_accounts = cash_accounts.concat([{id : 0, account :  "(Invoice) " + client_name}]);
                    $scope.amount_paid = process_total;
                    $scope.balance = 0;
                    $scope.transaction_notes = null;
                    $scope.selected_payment_option = 0;
                    $scope.payment_options = [];
                    $scope.addPaymentOption = function(){
                        if ($scope.amount_paid == null) $scope.amount_paid = 0;
                        if ($scope.amount_paid > 0 && isArray($scope.cash_accounts) && $scope.cash_accounts.length > 0 && $scope.selected_payment_option >= 0 && $scope.selected_payment_option < $scope.cash_accounts.length){
                            $scope.payment_options.push(freeObj({
                                amount : $scope.amount_paid,
                                id : $scope.cash_accounts[$scope.selected_payment_option].id,
                                account : $scope.cash_accounts[$scope.selected_payment_option].account
                            }));
                            $scope.amount_paid = null;
                            $scope.selected_payment_option = 0;
                            $scope.calcBalance();
                        }
                    };
                    $scope.removePaymentOption = function(pos){
                        if (!isNaN(pos) && isArray($scope.payment_options) && pos >= 0 && pos < $scope.payment_options.length){
                            $scope.payment_options.splice(pos, 1);
                            $scope.calcBalance();
                        }
                    };
                    $scope.calcBalance = function(){
                        var currentAmount = $scope.amount_paid;
                        if (isArray($scope.payment_options)){
                            for (var i = 0; i < $scope.payment_options.length; i ++){
                                var payment_option = $scope.payment_options[i];
                                if (objectHasKeys(payment_option) && payment_option.hasOwnProperty("amount")){
                                    currentAmount += toNumber(payment_option.amount, 0);
                                }
                            }
                        }
                        var balance = freeObj($scope.process_total - currentAmount);
                        $scope.balance = balance;
                    };
                    $scope.completeTransaction = function(event){
                        var normalizePayments = function(){
                            var items = [];
                            var payments = $scope.payment_options;
                            if ($scope.amount_paid > 0){
                                payments.push(freeObj({
                                    amount : $scope.amount_paid,
                                    id : $scope.cash_accounts[$scope.selected_payment_option].id,
                                    account : $scope.cash_accounts[$scope.selected_payment_option].account
                                }));
                            }
                            for (var i = 0; i < payments.length; i ++){
                                var payment = payments[i];
                                if (payment.hasOwnProperty("id") && isNaN(payment.id) && !emptyString(payment.id)){
                                    items.push({
                                        account : payment.id.toString().trim(),
                                        amount : toNumber(payment.amount, 0)
                                    });
                                }
                            }
                            return items;
                        };
                        transaction_details.payments = normalizePayments();
                        transaction_details.notes = $scope.transaction_notes;
                        var wait = $alert.wait("Processing transaction...", event);
                        //uncomment below for testing...
                        //setTimeout(function(){ wait.hide(); $scope.complete("3110b9599c27c53a72091085443b7da3faa31942");}, 1000);
                        $appAPI.tQuery(transaction_details, {
                            success : function(data){
                                wait.hide();
                                $scope.complete(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Processing", error, event);
                            }
                        });
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.complete = function(data){
                        $mdDialog.hide(data);
                    };
                },
                templateUrl: "res/business_sales/business_sale_prompt.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:false,
                fullscreen: $mdMedia("xs")
            })
            .then(function(journal_id){
                $scope.items = [];
                $scope.resetItem();
                $scope.fetchSalesList();
                var fetch_document = function(type){
                    var wait = $alert.wait("Fetching document details...");
                    var doPrintElement = function(printElement, event){
                        $scope.documentPrintModal(event, type, printElement);
                    };
                    $appAPI.tQuery({get_sale_transaction_document : journal_id, invoice : (type == "Invoice" ? 1 : 0)},{
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
                $mdDialog.show({
                    controller: function($scope, $mdDialog){
                        $scope.cancel = function(){
                            $mdDialog.cancel();
                        };
                        $scope.hide = function(){
                            $mdDialog.hide();
                        };
                        $scope.print = function(type){
                            $mdDialog.hide(type);
                        };
                    },
                    templateUrl: "res/business_sales/business_sale_complete.html",
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    fullscreen: false
                })
                .then(function(print_type){
                    if (print_type.toLowerCase().trim() != "etr") $scope.showPrint(null, journal_id, print_type);
                    else fetch_document(print_type);
                });
            });
        };

        //sales list
        $rootScope.sales_list = $rootScope.hasOwnProperty("sales_list") ? $rootScope.sales_list : [];
        //$rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        //$scope.fetchItems($rootScope, "business_cash_accounts", null, {get_business_payment_accounts : $rootScope.businessId});
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
                    if (objectHasKeys(data) && data.hasOwnProperty("page_data") && isArray(data.page_data)){
                        var sales_list = data.page_data;
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
            
            if (type.toLowerCase().trim() != "etr"){
                $state.go("dashboard.business.print", {
                    from : "sales",
                    type : type.toLowerCase(),
                    journalId : journal_id
                });
                return;
            }
            
            
            var wait = $alert.wait("Fetching document details...");
            var doPrintElement = function(printElement, event){
                $scope.documentPrintModal(event, type, printElement);
            };
            $appAPI.tQuery({get_sale_transaction_document : journal_id, invoice : (type == "Invoice" ? 1 : 0)},{
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