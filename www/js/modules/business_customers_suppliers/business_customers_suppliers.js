(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(3, "people", "Customers & Suppliers", "dashboard.business.business_customers_suppliers");
        $businessLinksProvider.addToLeftMenu(8, "people", "Customers & Suppliers", "dashboard.business.business_customers_suppliers");
        $sessionProvider.addProtectedState("dashboard.business.business_customers_suppliers");
        $stateProvider.state("dashboard.business.business_customers_suppliers", {
            url: "/customers-suppliers",
            templateUrl: "res/business_customers_suppliers/business_customers_suppliers.html",
            controller: business_customers_suppliersCtrl
        });
    }]);
    function business_customers_suppliersCtrl($scope, $rootScope, $appAPI, $stateParams, $mdDialog, $mdMedia, $alert){
        $rootScope.businessId = $stateParams.businessId;
        $rootScope.business_suppliers = $rootScope.hasOwnProperty("business_suppliers") ? $rootScope.business_suppliers : [];
        $rootScope.business_customers = $rootScope.hasOwnProperty("business_customers") ? $rootScope.business_customers : [];
        $scope.fetchCustomers = function(){
            $scope.fetchItems($rootScope, "business_customers", "page_data", {get_business_customers : $rootScope.businessId});
        };
        $scope.fetchSuppliers = function(){
            $scope.fetchItems($rootScope, "business_suppliers", "page_data", {get_business_suppliers : $rootScope.businessId});
        };
        $scope.deleteCustomer = function(pos, event){
            if (isArray($rootScope.business_customers) && !isNaN(pos) && pos < $rootScope.business_customers.length){
                var item = $rootScope.business_customers[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id") && !emptyString(item.id)){
                    $scope.onDeleteToast(event, {delete_business_customer : item.id}, "undo_delete_business_customer", function(){
                        $rootScope.business_customers.splice(pos, 1);
                        $rootScope.reapply();
                    }, function(){
                        $scope.fetchCustomers();
                    });
                }
            }
        };
        $scope.deleteSupplier = function(pos, event){
            if (isArray($rootScope.business_suppliers) && !isNaN(pos) && pos < $rootScope.business_suppliers.length){
                var item = $rootScope.business_suppliers[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id") && !emptyString(item.id)){
                    $scope.onDeleteToast(event, {delete_business_supplier : item.id}, "undo_delete_business_supplier", function(){
                        $rootScope.business_suppliers.splice(pos, 1);
                        $rootScope.reapply();
                    }, function(){
                        $scope.fetchSuppliers();
                    });
                }
            }
        };
        $scope.fetchCustomers();
        $scope.fetchSuppliers();
        $scope.editCustomer = function(pos, event){
            if (isArray($rootScope.business_customers) && !isNaN(pos) && pos < $rootScope.business_customers.length){
                var item = $rootScope.business_customers[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id") && !emptyString(item.id)){
                    $scope.editModal(event, "customer", {id : "customer"}, {edit_business_customer : $rootScope.businessId}, item, function(data){
                        $alert.success("Customer updated!", data, event);
                    });
                }
            }
        };
        $scope.editSupplier = function(pos, event){
            if (isArray($rootScope.business_suppliers) && !isNaN(pos) && pos < $rootScope.business_suppliers.length){
                var item = $rootScope.business_suppliers[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id") && !emptyString(item.id)){
                    $scope.editModal(event, "supplier", {id : "supplier"}, {edit_business_supplier : $rootScope.businessId}, item, function(data){
                        $alert.success("Supplier updated!", data, event);
                    });
                }
            }
        };
        $scope.newCustomer = function(event){
            $scope.editModal(event, "customer", {id : "customer"}, {edit_business_customer : $rootScope.businessId}, null, function(data){
                $alert.success("New Customer Added", data);
                $scope.fetchCustomers();
            });
        };
        $scope.newSupplier = function(event){
            $scope.editModal(event, "supplier", {id : "supplier"}, {edit_business_supplier : $rootScope.businessId}, null, function(data){
                $alert.success("New Supplier Added", data);
                $scope.fetchSuppliers();
            });
        };
        $scope.editModal = function(event, editType, replaceRequest, customRequest, editItem, onSuccess, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert){
                    $scope.businessTaxes = $rootScope.business_taxes;
                    $scope.taxStatuses = $rootScope.tax_statuses;
                    $scope.trackedStatuses = $rootScope.tracked_status;
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
                        var template = {id : "", customer : "", name : "", phone : "", email : "", website : "", physical_address : "", postal_address : ""};
                        for (var key in edit){
                            if (edit.hasOwnProperty(key)){
                                template[key] = edit[key];
                            }
                        }
                        return template;
                    };
                    $scope.edit = $scope.setEdit(editItem);
                    $scope.saveEdit = function(event){
                        var wait = $alert.wait("Saving details...", event);
                        var request = customRequest;
                        for (var key in $scope.edit) if ($scope.edit.hasOwnProperty(key)) request[key] = $scope.edit[key];
                        if (objectHasKeys(replaceRequest)){
                            for (var key in replaceRequest){
                                if (replaceRequest.hasOwnProperty(key)){
                                    request[replaceRequest[key]] = request[key];
                                    delete request[key];
                                }
                            }
                        }
                        console.log("save", request);
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
                templateUrl: "res/business_customers_suppliers/business_customers_suppliers_edit.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };
    }
})();