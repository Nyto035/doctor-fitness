(function (angular, _) { // eslint-disable-line func-names
    angular.module('app.controllers.businessInformation', [
        'app.services.businessInputs'
    ])
    .controller('app.controllers.businessInformationController', informationController);

    informationController.$inject = [
        '$scope','app.services.businessInputs.form','sil.oauth2.authConfig', 
        'UserService', '$ionicPlatform', '$state', 'apiBackend', '$stateParams',
        'app.services.businessProfile',
    ];

    function informationController($scope, frmService, authConfig, UserService, 
        $ionicPlatform, $state, callApi, $stateParams, profile) {
        $scope.title = 'My Businesses';
        $scope.loaded = true;
        $scope.profileFields = profile.basicDetails();
        $scope.contactFields = profile.contactDetails();
        $scope.showOrHide = function(val) {
            if (_.isArray(val)) {
                if (_.isEmpty(val[0])) {
                    return false;
                } else {
                    return val[0];
                }
            } else {
                return val;
            }
        }
        $scope.filterCurrency = function currFxn(key) {
            if (key !== 'currencies') {
                return;
            }
            var obj = _.findWhere($scope[key], {'id': parseInt($scope.business_details.currency_id, 10)});
            $scope.business_details.currency_name = obj.code;
        };
        $scope.getOtherDetails = function(key, obj) {
            callApi.postApi(obj)
            .then(function(response){
                $scope[key] = response.data.data;
                $scope.filterCurrency(key);
            })
            .catch(function(err) {
                console.log(err);
            });
        };
        $scope.getData = function dataFxn(obj) {
            callApi.postApi(obj)
            .then(function(response){
                $scope.loaded = false;
                $scope.business_details = response.data.data;
            })
            .catch(function(err) {
                $scope.loaded = false;
                console.log(err);
            });
        }
        $scope.businessDetails = function aBizz() {
            var postObj = {
                get_business_details: $scope.business.id,
                token: $scope.user.token
            };
            var currObj = { get_currencies: 1, token: $scope.user.token };
            $scope.getData(postObj);
            $scope.getOtherDetails('currencies', currObj);
        };
        $scope.getBusinessDetails = function bizGet() {
            UserService.getLoggedInUsers().then(function (results) {
                if (results.rows.length > 0) {
                    $scope.user = results.rows.item(0);
                    $scope.user.businesses = JSON.parse($scope.user.businesses);
                    $scope.business = _.findWhere($scope.user.businesses, { 'id': $stateParams.id});
                    $scope.businessDetails();
                }
            }, function (error) {
                NotificationService.showError(error);
            });            
        };
        $ionicPlatform.ready(function () {
            $scope.getBusinessDetails();
        });
    }
}(window.angular, window._));
