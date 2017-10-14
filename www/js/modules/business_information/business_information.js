(function(){
    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", "$businessLinksProvider", function ($stateProvider, $sessionProvider, $businessLinksProvider) {
        $businessLinksProvider.addToDashboard(1, "settings", "Business Information", "dashboard.business.business_information");
        $businessLinksProvider.addToLeftMenu(2, "settings", "Business Information", "dashboard.business.business_information");
        $sessionProvider.addProtectedState("dashboard.business.business_information");
        $stateProvider.state("dashboard.business.business_information", {
            url: "/business-information",
            templateUrl: "res/business_information/business_information.html",
            controller: business_informationCtrl
        });
    }]);

    function business_informationCtrl($scope, $rootScope, $stateParams, $appAPI, $alert, $router, $state, $mdMedia, $mdDialog){
        $rootScope.businessId = $stateParams.businessId;
        $scope.businessLoaded = $rootScope.business != null;
        $scope.getTempKey = function(key){
            return !emptyString(key) ? key + "_temp" : "undefined_temp";
        };
        $scope.toggleEdit = function(event, toggleKey, editKey, onEdit, onSaveChanges, onCancelSave){
            if (!$scope.businessLoaded) return;
            if (!emptyString(toggleKey) && $scope.hasOwnProperty(toggleKey) && !emptyString(editKey) && $scope.hasOwnProperty(editKey)){
                var tempKey = $scope.getTempKey(editKey);
                var promptSave = false;
                if ($scope.hasOwnProperty(tempKey)) promptSave = !fullMatch($scope[editKey], $scope[tempKey]);
                var toggle = !$scope[toggleKey];
                if (!toggle){
                    if (promptSave){
                        var confirmOk = function(){
                            if ("function" === typeof onSaveChanges) onSaveChanges(event);
                            else $scope[toggleKey] = toggle;
                        };
                        var confirmCancel = function(){
                            if ("function" === typeof onCancelSave) onCancelSave(event);
                            else $scope[toggleKey] = toggle;
                        };
                        $alert.confirm("Save Changes?", "Would you like to save the changes?", "Save Changes", event, confirmOk, confirmCancel);
                    }
                    else $scope[toggleKey] = toggle;
                }
                else {
                    $scope[toggleKey] = toggle;
                    if ("function" === typeof onEdit) onEdit(event);
                }
            }
        };
        $scope.setEditTemp = function(key, store){
            store = "boolean" === typeof store && store;
            if ($scope.hasOwnProperty(key)){
                var tempKey = $scope.getTempKey(key);
                if (store){
                    $scope[tempKey] = $scope[key];
                    $scope[key] = freeObj($scope[tempKey]);
                    $scope.reapply();
                }
                else {
                    if ($scope.hasOwnProperty(tempKey)) {
                        $scope[key] = $scope[tempKey];
                        $scope[tempKey] = null;
                        $scope.reapply();
                    }
                }
            }
        };
        $scope.infoEditModal = function(event, template, editItem, editSaveMap, onSuccessSave, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.saveDetails = function(event){
                        var submit_request = {};
                        for (var key in editSaveMap){
                            if (editSaveMap.hasOwnProperty(key)){
                                var mapValue = editSaveMap[key];
                                submit_request[mapValue] = $scope.hasOwnProperty(key) ? $scope.edit[key] : mapValue;
                            }
                        }
                        console.log("submit_request", submit_request);
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: template,
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave, onClose);
        };

        //business currency
        $rootScope.currencies = $rootScope.hasOwnProperty("currencies") ? $rootScope.currencies : [];
        $scope.fetchItems($rootScope, "currencies", null, {get_currencies : 1});
        $scope.getCurrencyById = function(id){
            id = toNumber(id, 69);
            if (isArray($rootScope.currencies) && $rootScope.currencies.length > 1){
                for (var i = 0; i < $rootScope.currencies.length; i++){
                    var _currency = $rootScope.currencies[i];
                    if (objectHasKeys(_currency) && _currency.hasOwnProperty("id") && _currency.id === id){
                        return _currency;
                    }
                }
            }
            return null;
        };

        //details - editing
        $scope.isEditingDetails = false;
        $scope.editDetails = null;
        $scope.cancelEditDetails = function(){
            if ($scope.isEditingDetails){
                $scope.setEditTemp("editDetails");
                $scope.isEditingDetails = false;
            }
        };
        $scope.onEditDetails = function(){
            $scope.setEditTemp("editDetails", true);
        };
        $scope.saveDetails = function(event){
            var tempKey = $scope.getTempKey("editDetails");
            if (fullMatch($scope.editDetails, $scope[tempKey])){
                $alert.toast("There are no edit changes to save", 2000, "bottom right");
                $scope.setEditTemp("editDetails");
                $scope.isEditingDetails = false;
                return;
            }
            var save_details_request = {
                edit_business : $scope.editDetails.id,
                name : $scope.editDetails.name,
                pin : $scope.editDetails.pin,
                currency_id : $scope.editDetails.currency_id,
                logo : $scope.editDetails.logo,
                slogan : $scope.editDetails.slogan,
                receipt_footnote : $scope.editDetails.receipt_footnote,
                invoice_footnote : $scope.editDetails.invoice_footnote,
                quotation_footnote : $scope.editDetails.quotation_footnote,
                agent : $scope.editDetails.agent
            };
            var wait = $alert.wait("Saving changes...", event);
            $appAPI.tQuery(save_details_request, {
                success : function(){
                    $scope.isEditingDetails = false;
                    $state.reload();
                },
                error : function(error){
                    $alert.warning("Error Saving", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.changeBusinessLogo = function(event){
            $scope.uploadCropImage(event, function(src){
                if (objectHasKeys($scope.editDetails) && $scope.editDetails.hasOwnProperty("logo")){
                    $scope.editDetails.logo = src;
                    $scope.reapply();
                }
            });
        };
        $scope.closeBusiness = function(event){
            $alert.confirm(
                null,
                "<h1 class='uk-text-danger'><i class='uk-icon-ban'></i> Attention!</h1>" +
                "<h3>You are about to close this business</h3>" +
                "<ul class='uk-text-danger'>" +
                "<li>All users <strong>will not</strong> be able to access or use business resources</li>" +
                "<li>All your data will be saved for <strong>60 days after which will be deleted permanently</strong></li>" +
                "<li>You will be required to <strong>contact us to restore</strong> the business again</li>" +
                "</ul>" +
                "<p>Are you sure you want to close this business?</p>" +
                "<div class='uk-form'>" +
                "<textarea id='delete_notes' style='width: 98%' class='uk-margin-small-top uk-width-1-1' placeholder='Reason for closure'></textarea>" +
                "</div>",
                "Close Business",
                event,
                function(){
                    var notesElem = document.getElementById("delete_notes");
                    var delete_notes = notesElem !== null ? notesElem.value : null;
                    var delete_request = {
                        delete_business : $rootScope.businessId,
                        notes : delete_notes
                    };
                    var wait = $alert.wait("Closing business...", event);
                    $appAPI.tQuery(delete_request, {
                        success : function(data){
                            $router.go("dashboard.businesses");
                            $alert.toast("You have closed a business successfully", 8000, "bottom right", "Undo", function(){
                                var restoreWait = $alert.wait("Restoring closed business...", event);
                                $appAPI.tQuery({undo_delete_business : data}, {
                                    success : function(data){
                                        $alert.toast(data, 2000, "bottom right");
                                        $router.go("dashboard.business", {businessId : $rootScope.businessId});
                                    },
                                    error : function(error, xhr){
                                        console.error(error, xhr);
                                        $alert.toast(error, 2000, "bottom right");
                                    },
                                    then : function(){
                                        restoreWait.hide();
                                    }
                                });
                            });
                        },
                        error : function(error){
                            $alert.warning("Error Closing Business!", error, event);
                        },
                        then : function(){
                            wait.hide();
                        }
                    });
                }
            );
        };
        $scope.toggleEditingDetails = function(event){
            $scope.toggleEdit(event, "isEditingDetails", "editDetails", $scope.onEditDetails, $scope.saveDetails, function(){
                $scope.setEditTemp("editDetails");
                $scope.isEditingDetails = false;
            });
        };

        //contacts - editing
        $scope.editContactBranch = 0;
        $scope.isEditingContacts = false;
        $scope.editContacts = null;
        $scope.cancelEditContacts = function(){
            if ($scope.isEditingContacts){
                $scope.setEditTemp("editContacts");
                $scope.isEditingContacts = false;
            }
        };
        $scope.onEditContacts = function(){
            $scope.setEditTemp("editDetails", true);
        };
        $scope.saveContacts = function(event){
            var tempKey = $scope.getTempKey("editDetails");
            if (fullMatch($scope.editDetails, $scope[tempKey])){
                $alert.toast("There are no edit changes to save", 2000, "bottom right");
                $scope.setEditTemp("editDetails");
                $scope.isEditingContacts = false;
                return;
            }
            if ($scope.editDetails.hasOwnProperty("branches")){
                var trimArray = function(arr){
                    var items = [];
                    if (isArray(arr)){
                        for (var i = 0; i < arr.length; i++){
                            var item = arr[i];
                            if ("string" === typeof item && item.trim().length > 0){
                                items.push(item.trim());
                            }
                        }
                    }
                    return items;
                };
                var save_details_request = {
                    edit_business_branch : $rootScope.businessId,
                    branch_id : $scope.editDetails["branches"][$scope.editContactBranch].id,
                    name : $scope.editDetails["branches"][$scope.editContactBranch].name,
                    physical_address : $scope.editDetails["branches"][$scope.editContactBranch].physical_address,
                    postal_address : $scope.editDetails["branches"][$scope.editContactBranch].postal_address,
                    phones : trimArray($scope.editDetails["branches"][$scope.editContactBranch].phones),
                    emails : trimArray($scope.editDetails["branches"][$scope.editContactBranch].emails),
                    websites : trimArray($scope.editDetails["branches"][$scope.editContactBranch].websites),
                    socials : trimArray($scope.editDetails["branches"][$scope.editContactBranch].socials)
                };
                var wait = $alert.wait("Saving changes...", event);
                $appAPI.tQuery(save_details_request, {
                    success : function(){
                        $scope.isEditingContacts = false;
                        $state.reload();
                    },
                    error : function(error){
                        $alert.warning("Error Saving", error, event);
                    },
                    then : function(){
                        wait.hide();
                    }
                });
            }
        };
        $scope.toggleEditingContacts = function(event, onCancel){
            $scope.toggleEdit(event, "isEditingContacts", "editDetails", $scope.onEditContacts, $scope.saveContacts, function(){
                $scope.setEditTemp("editDetails");
                $scope.isEditingDetails = false;
                if ("function" === typeof onCancel) onCancel();
            });
        };

        //user groups - editing
        $rootScope.business_user_groups = $rootScope.hasOwnProperty("business_user_groups") ? $rootScope.business_user_groups : [];
        $rootScope.business_permissions = $rootScope.hasOwnProperty("business_permissions") ? $rootScope.business_permissions : [];
        $scope.fetchItems($rootScope, "business_permissions", null, {"get_permissions" : 1});
        $scope.fetchBusinessUserGroups = function(){
            $scope.fetchItems($rootScope, "business_user_groups", "page_data", {"get_business_user_groups" : $rootScope.businessId, start : 0, limit : 1000}, function(){
                if ($scope.hasOwnProperty("fetchBusinessUsers") && "function" === typeof $scope.fetchBusinessUsers){
                    $scope.fetchBusinessUsers();
                }
            });
        };
        $scope.createUserGroupEditItem = function(pos){
            var item = {id : "", name : "", permissions : [], timestamp : ""};
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_user_groups") && isArray($rootScope.business_user_groups) && $rootScope.business_user_groups.length > pos){
                item = freeObj($rootScope.business_user_groups[pos]);
            }
            var hasPermission = function(id){
                for (var i = 0; i < item.permissions.length; i++){
                    var _perm = item.permissions[i];
                    if (objectHasKeys(_perm) && _perm.hasOwnProperty("id") && _perm.id === id){
                        return true;
                    }
                }
                return false;
            };
            var newPermissions = [];
            for (var i = 0; i < $rootScope.business_permissions.length; i++){
                var permission = $rootScope.business_permissions[i];
                if (objectHasKeys(permission) && permission.hasOwnProperty("id")){
                    newPermissions.push({
                        id : permission.id,
                        name : permission.name,
                        selected : hasPermission(permission.id)
                    });
                }
            }
            item.edit_business_user_group = $rootScope.businessId;
            item.permissions = newPermissions;
            return item;
        };
        $scope.displayPermissions = function(arr){
            if (!isArray(arr)) return;
            var string = "";
            for (var i =0; i < arr.length; i++){
                if (objectHasKeys(arr[i]) && arr[i].hasOwnProperty("name")){
                    string += string.trim().length > 0 ? ", " + arr[i].name : arr[i].name;
                }
            }
            return string;
        };
        $scope.editUserGroupModal = function(event, editItem, onSuccessSave){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.permissions = $rootScope.business_permissions;
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.selectPermissions = function(selected){
                        for (var i = 0; i < $scope.edit.permissions.length; i++){
                            $scope.edit.permissions[i].selected = selected;
                        }
                    };
                    $scope.saveEdit = function(event){
                        var selected_permissions = [];
                        for (var i = 0; i < $scope.edit.permissions.length; i++){
                            var _perm = $scope.edit.permissions[i];
                            if (objectHasKeys(_perm) && _perm.hasOwnProperty("id") && _perm.hasOwnProperty("selected")){
                                if (_perm.selected) selected_permissions.push(_perm.id);
                            }
                        }
                        var submit_request = freeObj($scope.edit);
                        submit_request.permissions = selected_permissions;
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error);
                            }
                        });
                    };
                },
                templateUrl: "res/business_information/business_information_edit_user_group.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave);
        };
        $scope.newUserGroup = function(event){
            $scope.editUserGroupModal(event, $scope.createUserGroupEditItem(), $scope.fetchBusinessUserGroups);
        };
        $scope.editUserGroup = function(pos, event){
            $scope.editUserGroupModal(event, $scope.createUserGroupEditItem(pos), $scope.fetchBusinessUserGroups);
        };
        $scope.deleteUserGroup = function(pos, event){
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_user_groups") && isArray($rootScope.business_user_groups) && $rootScope.business_user_groups.length > pos) {
                var item = $rootScope.business_user_groups[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_user_group: item.id}, "undo_delete_business_user_group", function () {
                        $rootScope.business_user_groups.splice(pos, 1);
                    }, $scope.fetchBusinessUserGroups);
                }
            }
        };

        //users - editing
        $rootScope.business_users = $rootScope.hasOwnProperty("business_users") ? $rootScope.business_users : [];
        $scope.fetchBusinessUsers = function(){
            $scope.fetchItems($rootScope, "business_users", "page_data", {"get_business_users" : $rootScope.businessId, start : 0, limit : 1000});
        };
        $scope.createUserEditItem = function(pos){
            var item = { id : "", names : "", email: "", phone : "", groups : [], branches : [], status : "ACTIVE", notes : ""};
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_users") && isArray($rootScope.business_users) && $rootScope.business_users.length > pos){
                item = freeObj($rootScope.business_users[pos]);
            }
            var hasItem = function(arr, key, value){
                if (isArray(arr) && !emptyString(key)) {
                    for (var i = 0; i < arr.length; i++) {
                        var _item = arr[i];
                        if (objectHasKeys(_item) && _item.hasOwnProperty(key)) {
                            if (_item[key] === value) return true;
                        }
                    }
                }
                return false;
            };
            var newGroups = [];
            if ($rootScope.hasOwnProperty("business_user_groups") && isArray($rootScope.business_user_groups)){
                for (var i = 0; i < $rootScope.business_user_groups.length; i++){
                    var group = $rootScope.business_user_groups[i];
                    if (objectHasKeys(group) && group.hasOwnProperty("id") && group.hasOwnProperty("name")){
                        newGroups.push({
                            id : group.id,
                            name : group.name,
                            selected : hasItem(item.groups, "id", group.id)
                        })
                    }
                }
            }
            var newBranches = [];
            if ($rootScope.hasOwnProperty("business") && objectHasKeys($rootScope.business) && $rootScope.business.hasOwnProperty("branches") && isArray($rootScope.business.branches)){
                for (var b = 0; b < $rootScope.business.branches.length; b++){
                    var branch = $rootScope.business.branches[b];
                    if (objectHasKeys(branch) && branch.hasOwnProperty("id") && branch.hasOwnProperty("name")){
                        newBranches.push({
                            id : branch.id,
                            name : branch.name,
                            selected : hasItem(item.branches, "id", branch.id)
                        })
                    }
                }
            }
            item.groups = newGroups;
            item.branches = newBranches;
            item.edit_business_user = $rootScope.businessId;
            return item;
        };
        $scope.userItems = function(arr, key){
            var items = [];
            if (isArray(arr)){
                for (var i = 0; i < arr.length; i++){
                    var item = arr[i];
                    if (objectHasKeys(item) && item.hasOwnProperty(key)) items.push(item[key]);
                }
            }
            return items.join(", ");
        };
        $scope.editUserModal = function(event, editItem, onSuccessSave){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.statuses = ["ACTIVE", "SUSPENDED"];
                    $scope.saveEdit = function(event){
                        var getSelectedItemsIds = function(arr){
                            var items = [];
                            if (isArray(arr)){
                                for (var i = 0; i < arr.length; i++){
                                    var item = arr[i];
                                    if (objectHasKeys(item) && item.hasOwnProperty("id") && item.hasOwnProperty("selected")){
                                        if ("boolean" === typeof item["selected"] && item["selected"]) items.push(item["id"]);
                                    }
                                }
                            }
                            return items;
                        };
                        var newGroups = getSelectedItemsIds($scope.edit.groups);
                        var newBranches = getSelectedItemsIds($scope.edit.branches);
                        var submit_request = freeObj($scope.edit);
                        submit_request.groups = newGroups;
                        submit_request.branches = newBranches;
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error);
                            }
                        });
                    };
                },
                templateUrl: "res/business_information/business_information_edit_user.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave);
        };
        $scope.newUser = function(event){
            $scope.editUserModal(event, $scope.createUserEditItem(), $scope.fetchBusinessUsers);
        };
        $scope.editUser = function(pos, event){
            $scope.editUserModal(event, $scope.createUserEditItem(pos), $scope.fetchBusinessUsers);
        };
        $scope.deleteUser = function(pos, event){
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_users") && isArray($rootScope.business_users) && $rootScope.business_users.length > pos) {
                var item = $rootScope.business_users[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_user: item.id}, "undo_delete_business_user", function () {
                        $rootScope.business_users.splice(pos, 1);
                    }, $scope.fetchBusinessUsers);
                }
            }
        };

        //branches - editing
        $scope.updateBusinessBranches = function(){
            $state.reload();
        };
        $scope.createBranchEditItem = function(pos){
            var item = {id : null, name : null, physical_address : null, postal_address : null, phones : [], emails : [], websites : [], socials : []};
            if (!isNaN(pos) && objectHasKeys($scope.editDetails) && $scope.editDetails.hasOwnProperty("branches") && isArray($scope.editDetails.branches) && $scope.editDetails.branches.length > pos){
                item = freeObj($scope.editDetails.branches[pos]);
            }
            item.edit_business_branch = $rootScope.businessId;
            return item;
        };
        $scope.editBranchModal = function(event, editItem, onSuccessSave){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.saveEdit = function(event){
                        var trimArray = function(arr){
                            var items = [];
                            if (isArray(arr)){
                                for (var i = 0; i < arr.length; i++){
                                    var item = arr[i];
                                    if ("string" === typeof item && item.trim().length > 0){
                                        items.push(item.trim());
                                    }
                                }
                            }
                            return items;
                        };
                        var submit_request = freeObj({
                            edit_business_branch : $scope.edit.edit_business_branch,
                            branch_id : $scope.edit.id,
                            name : $scope.edit.name,
                            physical_address : $scope.edit.physical_address,
                            postal_address : $scope.edit.postal_address,
                            phones : trimArray($scope.edit.phones),
                            emails : trimArray($scope.edit.emails),
                            websites : trimArray($scope.edit.websites),
                            socials : trimArray($scope.edit.socials)
                        });
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error);
                            }
                        });
                    };
                },
                templateUrl: "res/business_information/business_information_edit_branch.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave);
        };
        $scope.newBranch = function(event){
            $scope.editBranchModal(event, $scope.createBranchEditItem(), $scope.updateBusinessBranches);
        };
        $scope.editBranch = function(pos, event){
            $scope.editBranchModal(event, $scope.createBranchEditItem(pos), $scope.updateBusinessBranches);
        };
        $scope.deleteBranch = function(pos, event){
            if (!isNaN(pos) && objectHasKeys($scope.editDetails) && $scope.editDetails.hasOwnProperty("branches") && isArray($scope.editDetails.branches) && $scope.editDetails.branches.length > pos){
                var item = $scope.editDetails.branches[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_branch : item.id}, "undo_delete_business_branch", function(){
                        $scope.editDetails.branches.splice(pos, 1);
                    }, $scope.updateBusinessBranches);
                }
            }
        };

        //taxes - editing
        $rootScope.business_taxes = $rootScope.hasOwnProperty("business_taxes") ? $rootScope.business_taxes : [];
        $scope.fetchBusinessTaxes = function(){
            $scope.fetchItems($rootScope, "business_taxes", null, {get_business_taxes : $rootScope.businessId});
        };
        $scope.createTaxEditItem = function(pos){
            var item = { id : null, names : null, rate : null};
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_taxes") && isArray($rootScope.business_taxes) && $rootScope.business_taxes.length > pos){
                item = freeObj($rootScope.business_taxes[pos]);
            }
            item.edit_business_tax = $rootScope.businessId;
            return item;
        };
        $scope.editTaxModal = function(event, editItem, onSuccessSave){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.saveEdit = function(event){
                        var submit_request = freeObj($scope.edit);
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error);
                            }
                        });
                    };
                },
                templateUrl: "res/business_information/business_information_edit_tax.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave);
        };
        $scope.newTax = function(event){
            $scope.editTaxModal(event, $scope.createTaxEditItem(), $scope.fetchBusinessTaxes);
        };
        $scope.editTax = function(pos, event){
            $scope.editTaxModal(event, $scope.createTaxEditItem(pos), $scope.fetchBusinessTaxes);
        };
        $scope.deleteTax = function(pos, event){
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_taxes") && isArray($rootScope.business_taxes) && $rootScope.business_taxes.length > pos) {
                var item = $rootScope.business_taxes[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_tax: item.id}, "undo_delete_business_tax", function () {
                        $rootScope.business_taxes.splice(pos, 1);
                    }, $scope.fetchBusinessTaxes);
                }
            }
        };

        //cash accounts - editing
        $rootScope.business_cash_accounts = $rootScope.hasOwnProperty("business_cash_accounts") ? $rootScope.business_cash_accounts : [];
        $rootScope.business_cash_account_types = $rootScope.hasOwnProperty("business_cash_account_types") ? $rootScope.business_cash_account_types : [];
        $scope.fetchItems($rootScope, "business_cash_account_types", null, {get_cash_account_types : $rootScope.businessId}, function(data){ console.log("data", data); });
        $scope.fetchBusinessCashAccounts = function(){
            $scope.fetchItems($rootScope, "business_cash_accounts", null, {get_business_cash_accounts : $rootScope.businessId}, function(data){ console.log("data", data); });
        };
        $scope.createCashAccountEditItem = function(pos){
            var item = {id : null, type : 1, account_provider : null, account_holder : null, account_number : null};
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_cash_accounts") && isArray($rootScope.business_cash_accounts) && $rootScope.business_cash_accounts.length > pos){
                item = freeObj($rootScope.business_cash_accounts[pos]);
            }
            item.edit_business_cash_account = $rootScope.businessId;
            return item;
        };
        $scope.editCashAccountModal = function(event, editItem, onSuccessSave){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.edit = freeObj(editItem);
                    $scope.accountTypes = $rootScope.business_cash_account_types;
                    $scope.saveEdit = function(event){
                        var submit_request = freeObj({
                            edit_business_cash_account : $scope.edit.edit_business_cash_account,
                            account_id : $scope.edit.id,
                            type : $scope.edit.type,
                            account_provider : $scope.edit.account_provider,
                            account_holder : $scope.edit.account_holder,
                            account_number : $scope.edit.account_number
                        });
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(submit_request, {
                            success : function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error);
                            }
                        });
                    };
                },
                templateUrl: "res/business_information/business_information_edit_cash_acc.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccessSave);
        };
        $scope.newCashAccount = function(event){
            $scope.editCashAccountModal(event, $scope.createCashAccountEditItem(), $scope.fetchBusinessCashAccounts);
        };
        $scope.editCashAccount = function(pos, event){
            $scope.editCashAccountModal(event, $scope.createCashAccountEditItem(pos), $scope.fetchBusinessCashAccounts);
        };
        $scope.deleteCashAccount = function(pos, event){
            if (!isNaN(pos) && $rootScope.hasOwnProperty("business_cash_accounts") && isArray($rootScope.business_cash_accounts) && $rootScope.business_cash_accounts.length > pos) {
                var item = $rootScope.business_cash_accounts[pos];
                if (objectHasKeys(item) && item.hasOwnProperty("id")){
                    $scope.onDeleteToast(event, {delete_business_cash_account: item.id}, "undo_delete_business_cash_account", function () {
                        $rootScope.business_cash_accounts.splice(pos, 1);
                    }, $scope.fetchBusinessCashAccounts);
                }
            }
        };

        //self init business information
        $scope.initBusinessInformation = function(){
            $scope.editDetails = $rootScope.business;
            $scope.fetchBusinessUserGroups();
            $scope.fetchBusinessTaxes();
            $scope.fetchBusinessCashAccounts();
        };

        //business loaded listener
        if (!$scope.businessLoaded){
            $scope.setDashLoading(true);
            $scope.$on("root-business-updated", function(){
                $scope.businessLoaded = $rootScope.business != null;
                $scope.setDashLoading(false);
                $scope.initBusinessInformation();
            });
        }
        else $scope.initBusinessInformation();
    }
})();