(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider){
        $businessLinksProvider.addToDashboard(7, "rate_review", "Quotations", "dashboard.business.business_quotations");
        $sessionProvider.addProtectedState("dashboard.business.business_quotations");
        $stateProvider.state("dashboard.business.business_quotations", {
            url: "/quotations",
            templateUrl: "res/business_sales/business_quotations.html",
            controller: business_quotationsCtrl
        });
    }]);
    function business_quotationsCtrl(){}
})();