(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(2, "widgets", "Products & Services", "dashboard.business.business_products_services");
        $businessLinksProvider.addToLeftMenu(7, "widgets", "Products & Services", "dashboard.business.business_products_services", true);
        $sessionProvider.addProtectedState("dashboard.business.business_products_services");
        $stateProvider.state("dashboard.business.business_products_services", {
            url: "/products-services",
            templateUrl: "res/business_products_services/business_products_services.html",
            controller: business_products_servicesCtrl
        });
    }]);

    function business_products_servicesCtrl($rootScope, $scope, $appAPI, $alert, $stateParams, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_taxes = $rootScope.hasOwnProperty("business_taxes") ? $rootScope.business_taxes : [];
        $rootScope.tax_statuses = $rootScope.hasOwnProperty("tax_statuses") ? $rootScope.tax_statuses : [];
        $rootScope.tracked_status = $rootScope.hasOwnProperty("tracked_status") ? $rootScope.tracked_status : [];
        $rootScope.business_suppliers = $rootScope.hasOwnProperty("business_suppliers") ? $rootScope.business_suppliers : [];
        $rootScope.business_services = $rootScope.hasOwnProperty("business_services") ? $rootScope.business_services : [];
        $rootScope.business_products = $rootScope.hasOwnProperty("business_products") ? $rootScope.business_products : [];
        $scope.fetchItems($rootScope, "business_taxes", null, { get_business_taxes : $rootScope.businessId});
        $scope.fetchItems($rootScope, "tax_statuses", null, { get_tax_statuses : 1});
        $scope.fetchItems($rootScope, "tracked_status", null, { get_tracked_statuses : 1});
        $scope.fetchItems($rootScope, "business_suppliers", "page_data", {
            get_business_suppliers : $rootScope.businessId,
            start : 0,
            limit : 1000
        });
        $scope.updateServices = function(){
            $scope.fetchItems($rootScope, "business_services", "page_data", {
                get_business_outputs : $rootScope.businessId,
                type : 2
            });
        };
        $scope.updateProducts = function(){
            $scope.fetchItems($rootScope, "business_products", "page_data", {
                get_business_outputs : $rootScope.businessId,
                type : 1
            });
        };
        $scope.updateServices();
        $scope.updateProducts();
        $scope.newService = function(event){
            $scope.editModal(event, "service", null, function(message){
                $alert.success("Created Service", message, event);
                $scope.updateServices();
            });
        };
        $scope.newProduct = function(event){
            $scope.editModal(event, "product", null, function(message){
                $alert.success("Created Product", message, event);
                $scope.updateProducts();
            });
        };
        $scope.deleteService = function(pos, event){
            if ($rootScope.hasOwnProperty("business_services") && isArray($rootScope.business_services) && !isNaN(pos) && $rootScope.business_services.length > pos){
                var output = $rootScope.business_services[pos];
                if (objectHasKeys(output) && output.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_output : output.id}, "undo_delete_business_output", function(){
                        $rootScope.business_services.splice(pos, 1);
                    }, function(){
                        $scope.updateServices();
                    });
                }
            }
        };
        $scope.deleteProduct = function(pos, event){
            if ($rootScope.hasOwnProperty("business_products") && isArray($rootScope.business_products) && !isNaN(pos) && $rootScope.business_products.length > pos){
                var output = $rootScope.business_products[pos];
                if (objectHasKeys(output) && output.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_output : output.id}, "undo_delete_business_output", function(){
                        $rootScope.business_products.splice(pos, 1);
                    }, function(){
                        $scope.updateProducts();
                    });
                }
            }
        };
        $scope.editService = function(pos, event){
            if ($rootScope.hasOwnProperty("business_services") && isArray($rootScope.business_services) && !isNaN(pos) && pos >= 0 && pos < $rootScope.business_services.length){
                var editItem = $rootScope.business_services[pos];
                $scope.editModal(event, "service", editItem, function(message){
                    $alert.success("Updated Service", message, event);
                    $scope.updateServices();
                });
            }
        };
        $scope.editProduct = function(pos, event){
            if ($rootScope.hasOwnProperty("business_products") && isArray($rootScope.business_products) && !isNaN(pos) && pos >= 0 && pos < $rootScope.business_products.length){
                var editItem = $rootScope.business_products[pos];
                $scope.editModal(event, "product", editItem, function(message){
                    $alert.success("Updated Product", message, event);
                    $scope.updateProducts();
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
                        var template = { output : "", type : editType == "product" ? 1 : 2, name : "", code : "", buying_price : null, opening_stock : null, selling_price : null, supplier : "", taxid : "", taxstatus : 1, tracked : 1 };
                        for (var key in edit){
                            if (edit.hasOwnProperty(key)){
                                if (key == "id") template["output"] = edit[key];
                                else template[key] = edit[key];
                            }
                        }
                        console.log("new edit", template);
                        return template;
                    };
                    $scope.edit = $scope.setEdit(editItem);
                    $scope.saveEdit = function(event){
                        var request = { edit_business_output  : $rootScope.businessId };
                        var numberFix = ["buying_price","opening_stock","selling_price"];
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
                    };
                },
                templateUrl: "res/business_products_services/business_products_services_edit.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };
    }
})();