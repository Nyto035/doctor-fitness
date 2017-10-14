(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.business', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.businessController', businessController)
    .controller('app.controllers.aBusinessController', aBusinessController);

    businessController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', '$ionicModal', 'apiBackend',
    ];

    function businessController($scope, frmService, authConfig, UserService, $ionicPlatform,
        $state, $ionicModal, callApi) {
        $scope.title = 'My Businesses';
        $scope.createFields = frmService.createBusiness();
        $scope.biz_list = [];
        $scope.loaded = true;
        /*$scope.currencies = [
            { 'value': 'KES', 'label': 'KSHS' }
        ];*/
        $scope.user_token = '';
        $scope.a_business = {};
        $scope.opts = {};
        $scope.getConf = function confFxn(obj, key){
            callApi.postApi(obj)
            .then(function(response){
                $scope.opts[key] = response.data.data;
                if (key === 'currencies') {
                    var indVal = _.indexOf($scope.opts.currencies,
                        _.findWhere($scope.opts.currencies,
                        { 'name': 'Kenyan Shilling' }));

                    $scope.a_business.currency_id = $scope.opts.currencies[indVal].id;
                } else if (key === 'plans') {
                    var indVal = _.indexOf($scope.opts.plans,
                        _.findWhere($scope.opts.plans,
                        { 'name': 'Basic' }));
                    if (indVal >= 0){
                        $scope.a_business.plan = $scope.opts.plans[indVal].id;
                        $scope.fallBackPlan = $scope.opts.plans[indVal].id;
                    }
                }
            })
            .catch(function(err) {
                console.log(err);
            });
        };
        $scope.getBusinessConfigs = function() {
            var keyArr = [
                { 'get_currencies': 1, 'token': $scope.user.token },
                { 'get_plans': 1 },
            ];
            _.each(keyArr, function(obj) {
                if (_.indexOf(keyArr, obj) === 0) {
                    $scope.getConf(obj, 'currencies');
                } else if (_.indexOf(keyArr, obj) > 0){
                    $scope.getConf(obj, 'plans');
                }
            });
        };
        $scope.updateUser = function() {
            UserService.updateUser($scope.user)
            .then(function(response) {
                console.log(response);
                //$state.transitionTo($state.current,{},{reload:true, inherit: true, notify: true });
            },
            function (error) {
                console.log(error);
            });
        };
        $scope.getUserBusinesses = function getBizFxn(user) {
            const obj = {
                get_user_businesses: 1,
                token: $scope.user_token,
            };
            callApi.postApi(obj)
            .then(function(response) {
                $scope.businesses = response.data.data;
                $scope.biz_list = response.data.data;
                $scope.loaded = false;
                if (_.isMatch($scope.user.businesses, $scope.businesses)) {
                    console.log('Match');
                } else {
                    _.each($scope.businesses, function(biz) {
                        var obj = _.findWhere($scope.user.businesses, {'id': biz.id });
                        if (_.isUndefined(obj)) {
                            $scope.user.businesses.push(biz);
                        }
                    });
                    $scope.updateUser();
                }
            })
            .catch(function(err) {
                $scope.loaded = false;
                console.log(err);
            });
        };
        // $scope.user = authConfig.getUser();
        $ionicPlatform.ready(function () {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user_token = $scope.user.token;
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    // _.extendOwn($scope.biz_list, $scope.user.businesses);
                    $scope.getUserBusinesses($scope.user);
                    $scope.getBusinessConfigs();
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        });
        // create modal
        $scope.openModal = function($event) {
            $scope.biz_modal.show($event);
        };
        $scope.closeModal = function() {
            $scope.biz_modal.hide();
        };
        $scope.createModal = function() {
            $ionicModal.fromTemplateUrl('templates/add_business.html', {
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.biz_modal = modal;
                console.log($state.current.name);
                if ($state.current.name === 'businesses.list.new_business'){
                    $scope.openModal();
                }
            });
        };
        $scope.createModal();
        $scope.$on('$destroy', function() {
            $scope.biz_modal.remove();
        });
        // creating a business
        $scope.saveBusiness = function() {
            var bizObj = {
                phones: [],
                emails: [],
                main_branch_name: 'Main',
                logo: null,
                slogan: null,
                receipt_footnote: null,
                invoice_footnote: null,
                quotation_footnote: null,
            };
            _.extendOwn(bizObj, $scope.a_business);
            bizObj.plan = bizObj.plan || $scope.fallBackPlan;
            bizObj.agent = bizObj.agent || null;
            bizObj.pin = bizObj.pin || null;
            bizObj.phones.push($scope.a_business.phone_number);
            bizObj.emails.push($scope.a_business.email_address);
            bizObj.token = $scope.user_token;
            delete bizObj.phone_number;
            delete bizObj.email_address;
            callApi.postApi(bizObj)
            .then(function(result){
                if (result.data.response !== 'error') {
                    $scope.saved_biz = result.data.data;
                    // $scope.getUserBusinesses();
                    $scope.closeModal();
                    $state.go('businesses.list');
                } else {
                    $scope.errorMessage = result.data.data;
                    console.log($scope.errorMessage);
                }
            })
            .catch(function(err) {
                console.log(err);
            });
        };
        $scope.logOutUser = function() {
            console.log("Called");
            UserService.logoutUser().then(function (results) {
                if (results.rows.length > 0 || results.rows.length === 0) {
                    $state.go('login');
                }
            }, function (error) {
                NotificationService.showError(error);
            });
        };
    }

    aBusinessController.$inject = [
        '$scope', '$stateParams','$state' ,'UserService', '$ionicPlatform',
        'silDataStoreFactory', 'apiBackend', '$ionicModal', 'app.services.businessInputs.form',
        '$filter', '$ionicPopover', '$window'
    ];

    function aBusinessController($scope, $stateParams, $state, UserService, $ionicPlatform,
        silDataStoreFactory, callApi, $ionicModal, frmService, $filter, $ionicPopover, $window) {
        $scope.title = 'Home';
        $scope.loaded = true;
        $scope.dashboard = [
            { 'value': 0, 'type': 'Revenue'},
            { 'value': 0, 'type': 'Expenses'},
            { 'value': 0, 'type': 'Net Profit'},
        ];
        $scope.an_item = {};
        $scope.sale = {};
        $scope.a_payment = {};
        $scope.items = [];
        $scope.payments = [];
        $scope.totals = 0.00;
        $scope.pay_totals = 0.00;
        $scope.createFields = frmService.createSale();
        $scope.itemFields = frmService.addItem();
        $scope.setItemPrice = function itemPriceFxn() {
            var selected_item = _.findWhere(
                $scope.sales_items, { 'id': $scope.an_item.id});
            $scope.an_item.price = selected_item.selling_price;
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
                $scope.totals += (item.total - item.discount);
            });
        };
        /* Add Item to a sale in the frontend*/
        $scope.addItem = function addFxn(){
            var anObj = {};
            anObj = $scope.an_item;
            anObj.discount = $scope.an_item.discount || null,
            anObj.tax_amount = null,
            anObj.tax_id = $scope.an_item.tax_id,
            anObj.tax_rate = null,
            anObj.tax_name = null,
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
            const ind = _.indexOf($scope.payments, _.findWhere($scope.payments, {'id': anObj.id}));
            const valInd = _.indexOf($scope.accounts, _.findWhere($scope.accounts, {'account': anObj.account}));
            if (ind >= 0) {
                $scope.payments[ind].amount = anObj.amount;
                $scope.accounts[valInd].amount = anObj.amount;
            } else {
                $scope.payments.push(anObj);
                $scope.accounts[valInd].amount = anObj.amount;
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
            })
            .catch(function(err) {
                $scope.loaded = false;
                console.log(err);
            });
        };
        $scope.getBusinessCustomers = function bizCustFxn(obj){
            callApi.postApi(obj)
            .then(function(response){
                $scope.customers = response.data.data.page_data;
                var indVal = _.indexOf($scope.customers, _.findWhere($scope.customers, { 'name': 'Cash Sale'}));
                if (indVal >= 0) {
                    $scope.sale.client_id = $scope.customers[indVal].id;
                }
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

        $scope.getExpensedetails = function(postObj, cash_accounts) {
            $scope.bizStats(postObj);
            $scope.getPaymentAccounts(cash_accounts);
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
            console.log($state.current.name);
            switch($state.current.name){
            case 'app.dashboard': // str = str.replace(/^"(.*)"$/, '$1');
                postObj = {
                    get_dash_stats: $scope.business.id,
                    token: $scope.user.token
                };
                $scope.type = 'dashboard';
                $scope.bizStats(postObj);
                break;
            case 'app.sales': // str = str.replace(/^"(.*)"$/, '$1');
                $scope.business_data = {};
                postObj = {
                    get_business_sales_list: $scope.business.id,
                    page: 0,
                    limit: 100,
                    token: $scope.user.token
                };
                var custObj = {
                    get_business_customers: $scope.business.id,
                    token: $scope.user.token
                };
                var itemsObj = {
                    get_sale_items: $scope.business.id,
                    token: $scope.user.token
                };
                $scope.bizStats(postObj);
                $scope.getBusinessCustomers(custObj);
                $scope.getSalesItems(itemsObj, 'sales_items');
                $scope.getTaxes(taxObj);
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
                    // fetch businesses here
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
        $scope.saveSale = function saveFxn() {
            if ($scope.context === 'pay' || $scope.context === 'sale') {
                var saleObj = {
                    business_sale: $stateParams.id,
                    client_id: $scope.sale.client_id,
                    client_name: $scope.prefillName('name', $scope.sale.client_id, $scope.customers),
                    transaction_date: $scope.getDate(),
                    items: $scope.items,
                    branch_id: null,
                    payments: $scope.payments,
                    token: $scope.user.token,
                    notes: null,
                };
                callApi.postApi(saleObj)
                .then(function(response){
                    $scope.saved_sale = response.data.data;
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

        $scope.autoOpenModal = function autoFxn() {
            if ($state.includes('app.sales') && !_.isUndefined($state.params.is_open)) {
                $scope.openModal();
                $state.go($state.current, { is_open: undefined }, { notify: false });
            }
        };
        $scope.createModal = function() {
            $ionicModal.fromTemplateUrl('templates/new_sale.html', {
                id: 1,
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.autoOpenModal();
            });
            /* Create second modal*/
            $ionicModal.fromTemplateUrl('templates/payment_modal.html', {
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
        $scope.openModal = function($event) {
            $scope.modal.show($event);
            $scope.modal_context = 'sale';
        };
        $scope.createModal();
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
            $scope.popOverAcc = {};
            _.extendOwn($scope.popOverAcc, account);
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
        /* End of save fuxn*/
        $ionicPlatform.ready(function () {
            $scope.getBusinessDetails();
            // Opening modal after event fired
        });
    }
}(window.angular, window._));
