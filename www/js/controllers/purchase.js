(function(angular){
	angular.module('app.controllers.purchases',[
		'app.services.businessInputs'
	])
	.controller('app.controllers.purchasesController', purchasesController);

	purchasesController.$inject = [
        '$scope', '$stateParams','$state' ,'UserService', '$ionicPlatform',
        'silDataStoreFactory', 'apiBackend', '$ionicModal', 'app.services.businessInputs.form',
        '$filter', '$ionicPopover', '$window'
    ];

    function purchasesController($scope, $stateParams, $state, UserService, $ionicPlatform,
        silDataStoreFactory, callApi, $ionicModal, frmService, $filter, $ionicPopover, $window) {
        $scope.title = 'Purchases';
        $scope.loaded = true;
        $scope.an_item = {};
        $scope.sale = {};
        $scope.a_payment = {};
        $scope.items = [];
        $scope.payments = [];
        $scope.totals = 0.00;
        $scope.pay_totals = 0.00;
        $scope.createFields = frmService.createPurchase();
        $scope.itemFields = frmService.addItem(true);
        $scope.setItemPrice = function itemPriceFxn() {
            var selected_item = _.findWhere(
                $scope.sales_items, { 'id': $scope.an_item.id});
            $scope.an_item.price = parseFloat(selected_item.buying_price, 10);
            $scope.an_item.name = selected_item.name;
            $scope.an_item.tax_id = selected_item.taxid;
            $scope.an_item.tax_status = selected_item.taxstatus;
        };
        $scope.setTotal = function totalFxn() {
            $scope.an_item.qty = ($scope.an_item.qty < 0) ? 0 : $scope.an_item.qty;
            if (!_.isUndefined($scope.an_item.qty) &&
                !_.isUndefined($scope.an_item.price)) {
                $scope.an_item.total = $scope.an_item.qty * $scope.an_item.price;
            }
        };
        $scope.salesTotals = function salesFxn(){
            $scope.totals = 0.00;
            _.each($scope.items, function(item) {
                $scope.totals += item.total;
            });
        };
        /* Add Item to a sale in the frontend*/
        $scope.addItem = function addFxn(){
            var anObj = {};
            anObj = $scope.an_item;
            anObj.discount = $scope.an_item.discount || null,
            anObj.tax_amount = (anObj.qty * anObj.price * 0.16),
            anObj.tax_id = $scope.an_item.tax_id,
            anObj.tax_rate = 16,
            anObj.tax_name = 'VAT',
            anObj.tax_status = $scope.an_item.tax_status,
            $scope.items.push(anObj);
            $scope.salesTotals();
            $scope.an_item = {};
            $scope.closePopover();
        };/* Add a payment*/
        $scope.addPayment = function addPay(acc) {
            var anObj = {};
            // anObj = $scope.a_payment;
            anObj = acc;
            // anObj.account_name = $scope.prefillName('account', $scope.a_payment.account, $scope.accounts);
            // anObj.account_name = $scope.prefillAccount('account', acc.account, $scope.accounts);
            /* TODO add condition to update if paymnent object already exists in payments*/
            const ind = _.indexOf($scope.payments, _.findWhere($scope.payments, {'account': anObj.account}));
            if (ind >= 0) {
                $scope.payments[ind].amount = anObj.amount;
            } else {
                $scope.payments.push(anObj);
            }
            $scope.a_payment = {};
            $scope.paymentTotal();
            $scope.closePopover();
        };
        $scope.paymentTotal = function payTots() {
            $scope.pay_totals = 0.00;
            _.each($scope.payments, function(pay) {
                pay.account = pay.id;
                $scope.pay_totals += pay.amount;
            });
        };
        $scope.removePay = function rmPayFxn(obj){
            $scope.payments = _.without($scope.payments, obj);
            $scope.paymentTotal();
        };
        $scope.removeItem = function rmFxn(obj){
            $scope.items = _.without($scope.items, obj);
            $scope.salesTotals();
        };
        /* Get business taxes*/
        $scope.getTaxes = function taxesFxn(obj){
            callApi.postApi(obj)
            .then(function(response){
                $scope.taxes = response.data.data;
            })
            .catch(function(err) {
                console.log(err);
            });
        };
        $scope.getPaymentAccounts = function paymentFxn(obj){
            callApi.postApi(obj)
            .then(function(response){
                $scope.accounts = response.data.data;
                _.each($scope.accounts, (acc) => {
                    acc.account_name = acc.account;
                });
            })
            .catch(function(err) {
                console.log(err);
            });
        };

        $scope.getSalesItems = function salesItemsFxn(obj, key){
            callApi.postApi(obj)
            .then(function(response){
                $scope.loaded = false;
                // $scope.sales_items = response.data.data;
                $scope[key] = response.data.data;
                _.each($scope[key], function(item) {
                	item.id = item._id;
                });
            })
            .catch(function(err) {
                $scope.loaded = false;
                console.log(err);
            });
        };
        $scope.getBusinessSuppliers = function bizCustFxn(obj){
            callApi.postApi(obj)
            .then(function(response){
                $scope.suppliers = response.data.data.page_data;
            })
            .catch(function(err) {
                console.log(err);
            });
        };
        $scope.bizStats = function getBusinessStats(obj) {
            callApi.postApi(obj)
            .then(function(response){
                $scope.loaded = false;
                $scope.business_data = response.data.data;
                $scope.business_data.type = $scope.type;
            })
            .catch(function(err) {
                $scope.loaded = false;
                console.log(err);
                 if (err.status === -1 && $stateParams.refresh !== 1) {
                    $scope.loaded = true;
                    var paramObj = { refresh: 1 };
                    _.extendOwn($stateParams, paramObj);
                    $state.transitionTo($state.current, $stateParams, { notify: false} );
                    $window.location.reload(true);
                }
            });
        };

        $scope.businessesOperations = function optFxn(){
            var postObj = {};
            var taxObj = {
                get_business_taxes: $scope.business.id,
                token: $scope.user.token
            };
            var payAcc = {
                get_business_payment_accounts: $scope.business.id,
                token: $scope.user.token
            };
            switch($state.current.name){
            case 'app.purchases':
                $scope.business_data = {};
                postObj = {
                    get_business_purchases_list: $scope.business.id,
                    page: 0,
                    limit: 100,
                    token: $scope.user.token
                };
                var supplierObj = {
                    get_business_suppliers: $scope.business.id,
                    token: $scope.user.token
                };
                var outputs_and_inputs = {
                    get_business_inputs_and_outputs: $scope.business.id,
                    page: 0,
                    limit: 100,
                    token: $scope.user.token
                };
                var itemsObj = {
                    get_sale_items: $scope.business.id,
                    token: $scope.user.token
                };
                $scope.bizStats(postObj);
                $scope.getTaxes(taxObj);
                $scope.getBusinessSuppliers(supplierObj);
                $scope.getSalesItems(outputs_and_inputs, 'sales_items');
                // $scope.getSalesItems(outputs_and_inputs, 'purchase_items');
                $scope.getPaymentAccounts(payAcc);
                break;
            default:
                postObj = {
                    get_dash_stats: $scope.business.id,
                    token: $scope.user.token
                };
            }
        };

        $scope.getBusinessDetails = function bizGet() {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    $scope.business = _.findWhere($scope.user.businesses, { 'id': $stateParams.id});
                    $scope.businessesOperations();
                }
            }, function (error) {
                NotificationService.showError(error);
            });            
        };
        $scope.prefillName = function(key, value, src) {
            var obj = _.findWhere(src, {'id': value});
            return obj[key];
        };
        $scope.prefillAccount = function(key, value, src) {
            var obj = _.findWhere(src, {'account': value});
            return obj[key];
        };
        $scope.getDate = function() {
            var curr_date = new Date();
            curr_date = $filter('date')(curr_date, 'dd/MM/yyyy');
            return curr_date;
        }
        /* Save the whole sale on form submission*/
        $scope.savePurchase = function saveFxn() {
            if ($scope.context === 'pay' || $scope.context === 'sale') {
                var saleObj = {
                    business_purchases: $stateParams.id,
                    client_id: $scope.sale.supplier_id,
                    client_name: $scope.prefillName('name', $scope.sale.supplier_id, $scope.suppliers),
                    transaction_date: $scope.getDate(),
                    items: $scope.items,
                    branch_id: null,
                    invoice_no: null,
                    payments: $scope.payments,
                    token: $scope.user.token,
                    notes: null,
                };
                callApi.postApi(saleObj)
                .then(function(response){
                    $scope.saved_purchase = response.data.data;
                    $scope.sale = {};
                    $scope.items = [];
                    $scope.payments = [];
                    $scope.totals = 0.00;
                    $scope.pay_totals = 0.00;
                    $scope.loaded = true;
                    $scope.closeModal();
                    $scope.closePaymentModal();
                    $scope.getBusinessDetails();
                })
                .catch(function(err) {
                    console.log(err);
                });
            } else if ($scope.context === 'receipt') {
                var paymentObj = {
                    business_collect_payment: $stateParams.id,
                    transaction: $scope.a_sale.id,
                    transaction_date: $scope.getDate(),
                    payments: $scope.payments,
                    token: $scope.user.token,
                    notes: null,
                };
                callApi.postApi(paymentObj)
                .then(function(response) {
                    $scope.a_sale = {};
                    $scope.payments = [];
                    $scope.pay_totals = 0.00;
                    $scope.loaded = true;
                    $scope.closeReceiptModal();
                    $scope.getBusinessDetails();
                })
                .catch(function(err) {
                    console.log(err);
                });
            }
        };
        /* End of save fuxn*/
        $ionicPlatform.ready(function () {
            $scope.getBusinessDetails();
        });
        $scope.autoOpenModal = function autoFxn() {
            if ($state.includes('app.purchases') && !_.isUndefined($state.params.is_open)) {
                $scope.openModal();
                $state.go($state.current, { is_open: undefined }, { notify: false });
            }
        };
        $scope.createModal = function() {
            $ionicModal.fromTemplateUrl('templates/purchase/new_purchase.html', {
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.autoOpenModal();
            });
            /* Create second modal*/
            $ionicModal.fromTemplateUrl('templates/purchase/payment_modal.html', {
                id: 2,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.payment_modal = modal;
            });
            /* Create third modal*/
            $ionicModal.fromTemplateUrl('templates/receive_modal.html', {
                id: 3,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.receipt_modal = modal;
            });
        };
        $scope.createModal();
        $scope.openModal = function($event) {
            $scope.modal.show($event);
            $scope.modal_context = 'sale';
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.openPaymentModal = function($event) {
            $scope.payment_modal.show($event);
            $scope.modal_context = 'pay';
        };
        $scope.closePaymentModal = function() {
            $scope.payment_modal.hide();
            $scope.modal_context = 'sale';
        };
        $scope.openReceiptModal = function($event, sale) {
            if (sale.amount_due > 0) {
                $scope.receipt_modal.show($event);
                $scope.a_sale = sale;
                $scope.modal_context = 'receipt';
            }
        };
        $scope.closeReceiptModal = function() {
            $scope.receipt_modal.hide();
            $scope.modal_context = 'receipt';
        };
        /* Ionic popover*/
        /* $scope.popover = $ionicPopover.fromTemplate(template, {
            scope: $scope
        });*/

        // .fromTemplateUrl() method
        $scope.createPopover = function popFxn($event) {
            $ionicPopover.fromTemplateUrl('templates/add_payment.html', {scope: $scope})
            .then(function(popover) {
                $scope.popover = popover;
            });
        };
        $scope.createPopover();
        $scope.openPopover = function($event, context, account) {
            $scope.context = context;
            $scope.popOverAcc = account;
            if (!_.isUndefined($scope.popOverAcc) && context === 'pay') {
                $scope.popOverAcc.amount = $scope.popOverAcc.amount || $scope.totals - $scope.pay_totals;
            } else if (!_.isUndefined($scope.popOverAcc) && context === 'receipt') {
                $scope.popOverAcc.amount = $scope.a_sale.amount_due;
            }
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
            $scope.modal.remove();
            $scope.payment_modal.remove();
        });
        // Execute action on hidden popover
        $scope.$on('popover.hidden', function() {
            angular.noop;
        });
        $scope.$on('modal.hidden', function(event, modal) {
            if (modal.id === 1 && $scope.modal_context === 'sale'){
                $scope.popover.hide();
            } else if (modal.id === 2 && $scope.modal_context === 'pay'){
                $scope.popover.hide();
            } else if (modal.id === 3 && $scope.modal_context === 'receipt'){
                $scope.popover.hide();
            } else {
                $scope.popover.hide();
            }
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            angular.noop;
        });
        /* Logout user*/
        $scope.logOutUser = function() {
            UserService.logoutUser().then(function (results) {
                if (results.rows.length > 0) {
                    $state.go('login');
                }
            }, function (error) {
                NotificationService.showError(error);
            }); 
        };
    }
}(window.angular));