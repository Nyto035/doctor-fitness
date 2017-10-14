(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(10, "show_chart", "Reports Center", "dashboard.business.business_reports");
        $businessLinksProvider.addToLeftMenu(11, "show_chart", "Reports Center", "dashboard.business.business_reports");
        $sessionProvider.addProtectedState("dashboard.business.business_reports");
        $stateProvider.state("dashboard.business.business_reports", {
            url: "/quick-reports",
            templateUrl: "res/business_reports/business_reports.html",
            controller: business_reportsCtrl
        });
    }]);
    function business_reportsCtrl($rootScope, $scope, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_accounts = $rootScope.hasOwnProperty("business_accounts") ? $rootScope.business_accounts : [];
        $scope.fetchBusinessAccounts = function(){
            $scope.fetchItems($rootScope, "business_accounts", "page_data", {get_business_accounts : $rootScope.businessId});
        };
        $scope.reportTypes = [
            { type : 1, name : "Trial Balance", icon : "subject"},
            { type : 2, name : "Income Statement", icon : "monetization_on"},
            { type : 3, name : "Balance Sheet", icon : "exposure"},
            { type : 4, name : "Account Statement", icon : "chrome_reader_mode"}
        ];
        $scope.data = null;
        $scope.report = null;
        $scope.selected_report = null;
        $scope.runReport = function(pos, event){
            if (isArray($scope.reportTypes) && !isNaN(pos) && pos < $scope.reportTypes.length){
                var report = $scope.reportTypes[pos];
                var accounts = $rootScope.business_accounts;
                var businessId = $rootScope.businessId;
                $mdDialog.show({
                    controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                        $scope.businessId = businessId;
                        $scope.title = report.name;
                        $scope.accounts = accounts;
                        $scope.report = {
                            name : "",
                            type : report.type,
                            condensed : false,
                            accountid : "",
                            start_date : new Date((new Date()).getFullYear(), 0, 1),
                            end_date : new Date(),
                            as_at_date : new Date()
                        };
                        $scope.trial_types = [
                            {"name" : "Detailed", condensed : false},
                            {"name" : "Condensed", condensed: true}
                        ];
                        $scope.cancel = function(){
                            $mdDialog.cancel();
                        };
                        $scope.hide = function(){
                            $mdDialog.hide();
                        };
                        $scope.success = function(data){
                            $mdDialog.hide(data);
                        };
                        $scope.fetchReport = function(event){
                            var details = {};
                            if ($scope.report.type == 1){
                                details.get_trial_balance = $scope.businessId;
                                details.expanded = $scope.report.condensed == "true";
                                details.date = $scope.report.as_at_date.format("dd/MM/yyyy");
                            }
                            else if ($scope.report.type == 2){
                                details.get_income_statement = $scope.businessId;
                                details.start_date = $scope.report.start_date.format("dd/MM/yyyy");
                                details.end_date = $scope.report.end_date.format("dd/MM/yyyy");
                            }
                            else if ($scope.report.type == 3){
                                details.get_balance_sheet = $scope.businessId;
                                details.date = $scope.report.as_at_date.format("dd/MM/yyyy");
                            }
                            else if ($scope.report.type == 4){
                                details.get_account_statement = $scope.businessId;
                                details.account_id = $scope.report.accountid;
                                details.start_date = $scope.report.start_date.format("dd/MM/yyyy");
                                details.end_date = $scope.report.end_date.format("dd/MM/yyyy");
                            }
                            var wait = $alert.wait("Fetching "+ $scope.report.name +" report...", event);
                            $appAPI.tQuery(details, {
                                success: function(data){
                                    wait.hide();
                                    $scope.success(data);
                                },
                                error: function(error){
                                    wait.hide();
                                    $alert.warning("Fetch Error!", error, event);
                                }
                            });
                        };
                    },
                    templateUrl: "res/business_reports/report_modal.html",
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    fullscreen: $mdMedia("xs")
                }).then(function(data){
                    console.log("report_data", data);
                    $scope.data = data;
                    $scope.selected_report = report;
                    $scope.report = report;
                    $scope.reapply();
                });
            }
        };

        //init business accounts
        $scope.fetchBusinessAccounts();
    }
})();