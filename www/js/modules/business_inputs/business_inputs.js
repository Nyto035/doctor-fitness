(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToLeftMenu(6, "local_shipping", "Inputs", "dashboard.business.business_inputs");
        $sessionProvider.addProtectedState("dashboard.business.business_inputs");
        $stateProvider.state("dashboard.business.business_inputs", {
            url: "/inputs",
            templateUrl: "res/business_inputs/business_inputs.html",
            controller: business_inputsCtrl
        });
    }]);
    function business_inputsCtrl($rootScope, $scope, $appAPI, $alert, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_suppliers = $rootScope.hasOwnProperty("business_suppliers") ? $rootScope.business_suppliers : [];
        $scope.fetchItems($rootScope, "business_taxes", null, { get_business_taxes : $rootScope.businessId});
        $scope.fetchItems($rootScope, "tax_statuses", null, { get_tax_statuses : 1});
        $scope.fetchItems($rootScope, "tracked_status", null, { get_tracked_statuses : 1});
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        $rootScope.business_inputs = $rootScope.hasOwnProperty("business_inputs") ? $rootScope.business_inputs : [];
        $scope.fetchItems($rootScope, "business_cash_accounts", null, { get_business_cash_accounts : $rootScope.businessId});
        $scope.fetchItems($rootScope, "business_suppliers", "page_data", {
            get_business_suppliers : $rootScope.businessId,
            start : 0,
            limit : 1000
        });
        $scope.fetchInputs = function(){
            $scope.fetchItems($rootScope, "business_inputs", "page_data", {get_business_inputs : $rootScope.businessId, type : 1});
        };
         $scope.updateInput = function(){
            $scope.fetchItems($rootScope, "business_inputs", "page_data", {
                get_business_inputs : $rootScope.businessId,
               type:1
            });
        };
        $scope.fetchInputs();
        $scope.updateInput();
        $scope.newInput = function(event){
             var editItem = $rootScope.business_inputs.name;
            $scope.editModal(event, "input", editItem, function(message){
                $alert.success("Created Input", message, event);
               $scope.updateInput();
            });
            
        };
        $scope.editInput = function(pos, event){
            if ($rootScope.hasOwnProperty("business_inputs") && isArray($rootScope.business_inputs) && !isNaN(pos) && pos >= 0 && pos < $rootScope.business_inputs.length){
                var editItem = $rootScope.business_inputs[pos];
                $scope.editModal(event, "input", editItem, function(message){
                    $alert.success("Updated Input", message, event);
                    $scope.fetchInputs();
                });
            }
        };
        $scope.editModal = function(event, editType, editItem, onSuccess, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert){
                    $scope.businessTaxes = $rootScope.business_taxes;
                    $scope.taxStatuses = $rootScope.tax_statuses;
                    $scope.trackedStatuses = $rootScope.tracked_status;
                     $scope.business_suppliers = $rootScope.business_suppliers;
                    $scope.editType = editType;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.setEdit = function(edit){
                        var template = { input : "", type : editType == "product" ? 1 : 2, name : "", code : "", buying_price : null, opening_stock : null, supplier : "", taxid : "", taxstatus : 1};
                        for (var key in edit){
                            if (edit.hasOwnProperty(key)){
                                if (key == "id") template["input"] = edit[key];
                                else template[key] = edit[key];
                            }
                        }
                        console.log("new edit", template);
                        return template;
                    };
                    $scope.edit = $scope.setEdit(editItem);
                    $scope.saveEdit = function(event){
                        var request = { edit_business_input  : $rootScope.businessId };
                         var buying_price={};
                         buying_price=$scope.edit.name;
                        var numberFix = ["buying_price","opening_stock"];
                        if (objectHasKeys($scope.edit)) for (var key in $scope.edit) if ($scope.edit.hasOwnProperty(key)) request[key] = $scope.edit[key];
                        for (var i = 0; i < numberFix.length; i ++) if (request.hasOwnProperty(numberFix[i])) request[numberFix[i]] = toNumber(request[numberFix[i]], 0);
                
                        var wait = $alert.wait("Saving details...", event);
                        
                        $appAPI.tQuery(request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error, xhr){
                                wait.hide();
                                console.error("Error saving details", error, xhr);
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    
                        
                        setTimeout(function(){ wait.hide(); }, 2000);
                    };
                },
                templateUrl: "res/business_inputs/business_inputs_edit.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };
    }
})();