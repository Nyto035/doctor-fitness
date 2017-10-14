(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.businessExpenses', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.businessHomeController', homeController)
    .controller('app.controllers.businessExpensesController', expensesController);

    homeController.$inject = ['$scope', '$state'];

    function homeController($scope, $state) {
        $scope.goToState = function stateTrans(stateName) {
            $state.go(stateName, { 'is_open': 'open_modal'});
            $scope.$broadcast('add_item');
        };
    }

    expensesController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig',
        'UserService', '$ionicPlatform', '$state', 'apiBackend', '$stateParams',
        'app.services.businessProfile', '$ionicModal', '$filter',
    ];

    function expensesController($scope, frmService, authConfig, UserService,
        $ionicPlatform, $state, callApi, $stateParams, profile, $ionicModal, $filter) {
          $scope.expense = {};
          $scope.getSalesItems = function salesItemsFxn(obj, key){
              callApi.postApi(obj)
              .then(function(response){
                  $scope.loaded = false;
                  $scope[key] = response.data.data;
              })
              .catch(function(err) {
                  $scope.loaded = false;
                  console.log(err);
              });
          };
          $scope.getExpensedetails = function(postObj, cash_accounts) {
              $scope.bizStats(postObj);
              $scope.getPaymentAccounts(cash_accounts);
          };
          $scope.createFields = frmService.addExpense();

          $scope.autoOpenModal = function autoFxn() {
              if ($state.includes('app.expenses') && !_.isUndefined($state.params.is_open)) {
                  $scope.openModal();
                  $state.go($state.current, { is_open: undefined }, { notify: false });
              }
          };

          $scope.createModal = function() {
              $ionicModal.fromTemplateUrl('templates/expenses/new_expenses.html', {
                  id: 1,
                  scope: $scope,
                  animation: 'slide-in-up'
              }).then(function(modal) {
                  $scope.modal = modal;
                  $scope.autoOpenModal();
              });
          };
          $scope.createModal();
          $scope.getPaymentAccounts = function paymentFxn(obj){
              callApi.postApi(obj)
              .then(function(response){
                  $scope.accounts = response.data.data;
                 /* _.each($scope.accounts, (acc) => {
                      acc.account_name = acc.account;
                  });*/
              })
              .catch(function(err) {
                  console.log(err);
              });
          };
          $scope.openModal = function($event) {
              $scope.modal.show($event);
          };
          $scope.closeModal = function() {
              $scope.modal.hide();
          };
          //Cleanup the popover when we're done with it!
          $scope.$on('$destroy', function() {
              $scope.modal.remove();
          });
          $scope.business_data = {};
          $scope.getExpenses = function expenseFxn() {
              postObj = {
                  get_business_expenses_list: $scope.business.id,
                  type: 1,
                  page: 0,
                  limit: 100,
                  token: $scope.user.token
              };
              var cash_accounts = {
                  get_business_cash_accounts: $scope.business.id,
                  token: $scope.user.token,
              };
              var payAcc = {
                  get_business_payment_accounts: $scope.business.id,
                  token: $scope.user.token
              };
              $scope.getSalesItems(postObj, 'expenses');
              $scope.getPaymentAccounts(payAcc);
          };
          $scope.getBusinessDetails = function bizGet() {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    $scope.business = _.findWhere($scope.user.businesses, { 'id': $stateParams.id});
                    $scope.getExpenses();
                }
            }, function (error) {
                NotificationService.showError(error);
            });            
        };
        /* End of save fuxn*/
        $ionicPlatform.ready(function () {
            $scope.getBusinessDetails();
        });
        /* Save an expense*/
        $scope.getDate = function() {
            var curr_date = new Date();
            curr_date = $filter('date')(curr_date, 'dd/MM/yyyy');
            return curr_date;
        }
        $scope.saveExpense = function saveFxn() {
            var expenseObj = {
                business_expense: $stateParams.id,
                expense_type: 1,
                notes: null,
                token: $scope.user.token,
            };
            _.extendOwn($scope.expense, expenseObj);
            $scope.expense.transaction_date = $scope.getDate(); // collect real value
            callApi.postApi($scope.expense)
            .then(function(response){
                $scope.saved_expense = response.data.data;
                $scope.expense = {};
                $scope.loaded = true;
                $scope.closeModal();
                $scope.getBusinessDetails();
            })
            .catch(function(err) {
                console.log(err);
            });
        };
    }
}(window.angular, window._));
