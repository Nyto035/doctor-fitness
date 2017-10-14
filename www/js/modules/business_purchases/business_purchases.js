(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToLeftMenu(4, "shopping_basket", "Purchases", "dashboard.business.business_purchases", false);
        $sessionProvider.addProtectedState("dashboard.business.business_purchases");
        $stateProvider.state("dashboard.business.business_purchases", {
            url: "/purchases?tab",
            templateUrl: "res/business_purchases/business_purchases2.html",
            controller: business_purchasesCtrl
        });
    }]);
    function business_purchasesCtrl($rootScope, $scope, $state, $stateParams, $alert, $appAPI, $mdMedia, $mdDialog, $filter){
        $rootScope.businessId = $stateParams.businessId;
        $scope.selected_tab = $stateParams.tab || 0;
        $scope.purchase_supplier = null;
        $scope.purchase_query = null;
        $rootScope.business_suppliers = $rootScope.hasOwnProperty("business_suppliers") ? $rootScope.business_suppliers : [];
        $rootScope.business_products = $rootScope.hasOwnProperty("business_products") ? $rootScope.business_products : [];
        $rootScope.tax_statuses = $rootScope.hasOwnProperty("tax_statuses") ? $rootScope.tax_statuses : [];
        $rootScope.business_taxes = $rootScope.hasOwnProperty("business_taxes") ? $rootScope.business_taxes : [];
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];

        //self init items
        //products only
        $scope.fetchItems($rootScope, "business_suppliers", "page_data", {get_business_suppliers : $rootScope.businessId}, function(){
            if (isArray($rootScope.business_suppliers) && $rootScope.business_suppliers.length > 0) $scope.purchase_supplier = $rootScope.business_suppliers[0];
        });
        $scope.fetchItems($rootScope, "business_products", "page_data", {get_business_outputs : $rootScope.businessId, type : 1, page : 0, limit : 1000});
        $scope.fetchItems($rootScope, "tax_statuses", null, {get_tax_statuses : $rootScope.businessId});
        $scope.fetchItems($rootScope, "business_taxes", null, {get_business_taxes : $rootScope.businessId});
        $scope.fetchItems($rootScope, "business_cash_accounts", null, {get_business_payment_accounts : $rootScope.businessId});

        //search auto complete - supplier
        $scope.searchSupplier = function(){
            return $filter('filter')($rootScope.business_suppliers, $scope.purchase_query);
        };
        $scope.searchSupplierQueryChange = function(text){
            $scope.purchaseSupplierChange(text);
        };
        $scope.purchaseSupplierChange = function(item){
            $scope.purchase_supplier = item;
            $scope.reapply();
        };
        $scope.resetSearchSupplier = function(){
            $scope.purchase_query = null;
            $scope.purchase_supplier = null;
            if (isArray($rootScope.business_suppliers) && $rootScope.business_suppliers.length > 0){
                $scope.purchase_supplier = $rootScope.business_suppliers[0];
            }
            $scope.reapply();
        };

        //search auto complete - outputs
        $scope.purchase_output_item = null;
        $scope.purchase_output_query = null;
        $scope.purchaseOutputQueryTextChange = function(text){
            $scope.purchaseOutputItemChange(text);
        };
        $scope.purchaseOutputItemChange = function(item){
            $scope.purchase_output_item = item;
            $scope.setOutputItem();
        };
        $scope.setOutputItem = function(){
            if (objectHasKeys($scope.purchase_output_item)){
                $scope.item.id = $scope.purchase_output_item.id;
                $scope.item.name = $scope.purchase_output_item.name;
                $scope.item.price = $scope.purchase_output_item.buying_price;
                $scope.item.tax_id = $scope.purchase_output_item.taxid;
                $scope.item.tax_status = $scope.purchase_output_item.taxstatus;
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
                $scope.item.name = $scope.purchase_output_query;
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
        $scope.searchPurchaseOutputItem = function(){
            return $filter('filter')($rootScope.business_products, $scope.purchase_output_query);
        };
        $scope.resetPurchaseSearch = function(){
            $scope.purchase_output_item = null;
            $scope.purchase_output_query = null;
        };

        //purchase processing routines
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
            var tax_amount = calcTax(sub_total, $scope.item.tax_rate, 2);
            var total = sub_total;
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
                $scope.resetPurchaseSearch();
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
        $scope.processPurchase = function(event){
            $scope.itemAdd();
            if ($scope.items.length < 1){
                $alert.toast("Please add items for this transaction", 2000, "bottom right");
                return;
            }
            var process_total = $scope.items_total;
            var cash_accounts = $rootScope.business_cash_accounts;
            var transaction_details = {
                business_purchases : $rootScope.businessId,
                client_id : objectHasKeys($scope.purchase_supplier) ? $scope.purchase_supplier.id : "",
                client_name : objectHasKeys($scope.purchase_supplier) ? $scope.purchase_supplier.name : $scope.purchase_supplier,
                transaction_date : $scope.transaction_date.format("dd/MM/yyyy"),
                items : freeObj($scope.items),
                branch_id : ""
            };
            $mdDialog.show({
                controller: function($scope, $alert, $mdDialog){
                    $scope.process_total = process_total;
                    $scope.cash_accounts = cash_accounts.concat([{id : 0, account : "Credit (Invoice)"}]);
                    $scope.amount_paid = null;
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
                        $scope.balance = $scope.process_total - currentAmount;
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
                templateUrl: "res/business_purchases/business_purchases_prompt.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:false,
                fullscreen: $mdMedia("xs")
            })
                .then(function(journal_id){
                    $scope.items = [];
                    $scope.resetItem();
                    $scope.fetchPurchasesList();
                    var fetch_document = function(type){
                        var wait = $alert.wait("Fetching document details...");
                        $appAPI.tQuery({get_sale_transaction_document : journal_id, invoice : (type == "Invoice" ? 1 : 0)},{
                            success : function(data){
                                var business_logo = $rootScope.hasOwnProperty("business") && "object" === typeof $rootScope.business && $rootScope.business.hasOwnProperty("logo") && !emptyString($rootScope.business.logo) ? $rootScope.business.logo : "";
                                $scope.makePrintElement(type, business_logo, data, function(printElement){
                                    wait.hide();
                                    $scope.documentPrintModal(event, type, printElement);
                                });
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
                        templateUrl: "res/business_purchases/business_purchases_complete.html",
                        parent: angular.element(document.body),
                        targetEvent: event,
                        clickOutsideToClose: false,
                        fullscreen: false
                    })
                    .then(function(print_type){
                        $scope.showPrint(null, journal_id, print_type);
                        //fetch_document(print_type);
                    });
                });
        };

        //purchase list
        $rootScope.purchases_list = $rootScope.hasOwnProperty("purchases_list") ? $rootScope.purchases_list : [];
        $scope.fetchPurchasesList = function(){
            var isLoaded = $rootScope.hasOwnProperty("purchases_list") && $rootScope.purchases_list.length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            var request = {
                get_business_purchases_list : $rootScope.businessId,
                page : 0,
                limit : 100
            };
            $appAPI.tQuery(request, {
                success : function(data){
                    if (objectHasKeys(data) && data.hasOwnProperty("page_data") && isArray(data.page_data)){
                        var purchases_list = data.page_data;
                        if (isLoaded) objectUpdate($rootScope.purchases_list, purchases_list);
                        else $rootScope.purchases_list = purchases_list;
                        $rootScope.reapply();
                    }
                },
                error : function(error, xhr){
                    console.error("Error fetching purchases list", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };
        $scope.showPrint = function(journal_id, type){
            $state.go("dashboard.business.print", {
                from : "purchases",
                type : type.toLowerCase(),
                journalId : journal_id
            });
            /*
            var wait = $alert.wait("Fetching " + type.toLowerCase() + " details...");
            var doPrintElement = function(printElement){
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
            */
        };
        $scope.collectPayment = function(pos, event){
            if ($rootScope.hasOwnProperty("purchases_list") && isArray($rootScope.purchases_list) && !isNaN(pos) && pos < $rootScope.purchases_list.length){
                var _item = $rootScope.purchases_list[pos];
                if (objectHasKeys(_item) && _item.hasOwnProperty("id") && _item.hasOwnProperty("customer_names") && _item.hasOwnProperty("amount_due")){
                    $scope.collectPaymentModal(event, "Pay Supplier " + _item.customer_names, "Pay From", $rootScope.businessId, _item.id, _item.amount_due, $rootScope.business_cash_accounts, $scope.fetchPurchasesList);
                }
            }
        };
        //self init
        $scope.fetchPurchasesList();
    }
})();