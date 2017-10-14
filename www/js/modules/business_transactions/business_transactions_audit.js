(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(9, "security", "Transactions Audit", "dashboard.business.business_transactions_audit");
        $sessionProvider.addProtectedState("dashboard.business.business_transactions_audit");
        $stateProvider.state("dashboard.business.business_transactions_audit", {
            url: "/transactions-audit",
            templateUrl: "res/business_transactions/business_transactions_audit.html",
            controller: business_transactions_auditCtrl
        });
    }]);
    function business_transactions_auditCtrl(){}
})();