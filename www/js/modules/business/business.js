(function() {

    angular.module(APPLICATION_MODULE).run(["$rootScope", "$router", function($rootScope, $router){
        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
            if (toState.name === "dashboard.business") $router.go("dashboard.business.business_dashboard");
        });
        $rootScope.isMainLoading = false;
    }]);

    angular.module(APPLICATION_MODULE).provider("$businessLinks", function(){
        var business_links = {
            left_links : [],
            dashboard_links : []
        };
        var addItem = function(array, item){
            array.push(item);
            array.sort(function(a, b){
                return parseInt(a["order"]) - parseInt(b["order"]);
            });
        };
        this.addToDashboard = function(order, icon, name, stateRef){
            addItem(business_links.dashboard_links, {
                order : order,
                icon : icon,
                name : name,
                stateRef : stateRef
            });
        };
        this.addToLeftMenu = function(order, icon, name, stateRef, separator, hasSecondary, secondaryIcon, secondaryRef){
            addItem(business_links.left_links, {
                order : order,
                icon : icon,
                name : name,
                stateRef : stateRef,
                separator : separator,
                hasSecondary : hasSecondary,
                secondaryIcon :secondaryIcon,
                secondaryRef : secondaryRef
            });
        };
        this.$get = function(){
            return business_links;
        };
    });

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider) {
        $sessionProvider.addProtectedState("dashboard.business");
        $stateProvider.state("dashboard.business", {
            url: "/business/:businessId",
            templateUrl: "res/business/business.html",
            controller: businessCtrl
        });
    }]);

    function businessCtrl($rootScope, $scope, $alert, $appAPI, $stateParams, $router, $businessLinks, $mdDialog, $mdMedia){
        $rootScope.businessId = $stateParams.businessId;
        $scope.setSideNavLinks($businessLinks.left_links, true);
        $scope.setBusiness = function(){
            $scope.setDashboardTitle($rootScope.business.name);
            $scope.setSideNavLogo($rootScope.business.logo);
            $scope.setDashLoading(false);
        };
        if ($rootScope.hasOwnProperty("business") && objectHasKeys($rootScope.business)){
            $scope.setBusiness();
        }
        $scope.refreshBusinessDetails = function(){
            var isLoaded = $rootScope.hasOwnProperty("business") && objectHasKeys($rootScope.business);
            if (!isLoaded) $scope.setDashLoading(true);
            //-clear business data
            $rootScope.business_customers = [];
            $rootScope.business_outputs = [];
            $rootScope.tax_statuses = [];
            $rootScope.business_taxes = [];
            $rootScope.business_cash_accounts = [];
            //-/clear business data
            $appAPI.tQuery({get_business_details : $rootScope.businessId}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.business, data);
                    else $rootScope.business = data;
					if ($scope.billBusiness($rootScope.business)) return;
                    $rootScope.$broadcast("root-business-updated");
                    $rootScope.reapply();
                    $scope.setBusiness();
                },
                error : function(error, xhr){
                    $alert.warning(null, error);
                    $router.go("dashboard.businesses");
                    console.error("Business details fetch error: ", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                }
            });
        };

        //business documents modal
        $scope.documentPrintModal = function(event, title, element, onSuccess, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI, $session){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.title = title;
                    $scope.documentHTML = element.outerHTML;
                    $scope.documentHeight = function(){
                        var div = document.createElement("div");
                        div.style.display = "none";
                        div.appendChild(element);
                        document.querySelectorAll("body")[0].appendChild(div);
                        return 0;
                    };
                    $scope.documentFrame = null;
                    $scope.initFrame = function(onReady){
                        var frame = null;
                        var listener = setInterval(function(){
                            frame = document.getElementById("eko-document-frame");
                            if (frame != null){
                                clearInterval(listener);
                                if ("function" === typeof onReady) onReady(frame);
                            }
                        }, 1000);
                    };
                    $scope.initFrame(function(frame){
                        if (frame != null){
                            var etr_height = "400px";                        
                            var etr_css  = "<style type='text/css'>@media print { @page { size: 300px " + etr_height + "; margin: 0; } body  { margin: 0; }}</style>";
                            var other_css = "<style type='text/css'>@media print{ @page { margin: 0; } body  { margin: 1.6cm; }}</style>";
                            var html = (title.toLowerCase().trim() === "etr" ? etr_css : other_css) + $scope.documentHTML;
                            frame.contentWindow.document.write(html);
                            if (title.toLowerCase().trim() === "etr"){
                                var frameDoc = frame.contentDocument || frame.contentWindow.document;
                                var div = frameDoc.querySelector("body > div");
                                var style = frameDoc.querySelectorAll("style");
                                var divHeight = div.offsetHeight;
                                etr_height = divHeight + "px";
                                etr_css  = "<style type='text/css'>@media print { @page { size: 300px " + etr_height + "; margin: 0; } body  { margin: 0; }}</style>";
                                style.innerHTML = etr_css;
                            } 
                            $scope.documentFrame = frame;
                        }
                    });
                    $scope.printFrame = function(){
                        if ($scope.documentFrame != null){
                            	var frameDoc = $scope.documentFrame.contentDocument || $scope.documentFrame.contentWindow.document;
                                var div = frameDoc.querySelector("body > div");
                                var style = frameDoc.querySelectorAll("style");
                                var divHeight = div.offsetHeight;
                                divHeight = divHeight + 10;
                                var etr_height = divHeight + "px";
                                var etr_css  = "@media print { @page { size: 300px " + etr_height + "; margin: 0; } body  { margin: 0; }}";
                                style.innerHTML = etr_css;
                                $scope.documentFrame.contentWindow.document.getElementsByTagName("style")[0].innerHTML = etr_css;
                            $scope.documentFrame.contentWindow.focus();
                            $scope.documentFrame.contentWindow.print();
                        }
                    };
                    $scope.downloadPDF = function(event){
                        $alert.alert("Downloading...", "Your file should begin downloading. Retry if it fails.", event);
                        var form = document.createElement("form");
                        form.method = "POST";
                        form.action = $session.settings.serverURL;
                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.value = $scope.documentHTML;
                        input.name = "download_html_pdf";
                        form.appendChild(input);
                        document.body.appendChild(form);
                        form.submit();
                        form.remove();
                    };
                    $scope.email = null;
                    $scope.emailDocument = function(event){
                        var request = {
                            email : $scope.email,
                            business_email_document : $scope.documentHTML
                        };
                        var wait = $alert.wait("Sending document ...", event);
                        $appAPI.tQuery(request, {
                            success : function(data){
                                $alert.success("Email Sent!", data, event);
                                $scope.email = null;
                            },
                            error : function(error){
                                $alert.warning("Sending Failed!", error, event);
                            },
                            then : function(){
                                wait.hide();
                            }
                        });
                    };
                },
                templateUrl: "res/business/business_document_modal.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };

        //business edit modal universal
        $scope.itemsEditModal = function(event, editTitle, editItems, onSuccess, onClose){
            $mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert){
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.success = function(data){
                        $mdDialog.hide(data);
                    };
                    $scope.title = editTitle;
                    $scope.editItems = [];
                    $scope.serials_count = null;
                    $scope.serialsCount = function(){
                        var count = null;
                        if (isArray($scope.editItems)){
                            var serial_start = null;
                            var serial_end = null;
                            for (var i = 0; i < $scope.editItems.length; i++){
                                var _edit = $scope.editItems[i];
                                if (objectHasKeys(_edit) && _edit.hasOwnProperty("save") && _edit.save === "serial_start") serial_start = toNumber(_edit.value);
                                if (objectHasKeys(_edit) && _edit.hasOwnProperty("save") && _edit.save === "serial_end") serial_end = toNumber(_edit.value);
                                if (serial_start !== null && serial_end !== null) break;
                            }
                            count = toNumber(serial_end) - toNumber(serial_start);
                        }
                        return count;
                    };
                    $scope.$watch("serialsCount()", function(){
                        $scope.serials_count = $scope.serialsCount();
                    });
                    if (isArray(editItems)) $scope.editItems = editItems;
                    $scope.saveEdit = function(event){
                        if ($scope.editItems.length < 1) return;
                        var saveDetails = {};
                        for (var i = 0; i < $scope.editItems.length; i++){
                            var item = $scope.editItems[i];
                            if (objectHasKeys(item) && item.hasOwnProperty("save") && !emptyString(item.save) && item.hasOwnProperty("value")){
                                saveDetails[item.save] = item.value;
                            }
                        }
                        var wait = $alert.wait("Saving details...", event);
                        $appAPI.tQuery(saveDetails, {
                            success: function(data){
                                wait.hide();
                                $scope.success(data);
                            },
                            error: function(error){
                                wait.hide();
                                $alert.warning("Error Saving", error, event);
                            }
                        });
                    };
                },
                templateUrl: "res/business/edit_modal.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess, onClose);
        };

        //collect payment prompt
        $scope.collectPaymentModal = function(event, title, pay_account_title, businessId, transactionId, amountDue, cash_accounts, onSuccess){
            amountDue = toNumber(amountDue);
            if (amountDue < 1){
                $alert.toast("Sorry, this transaction has no arrears", 2000, "bottom right");
                return;
            }
            var process_total = amountDue;
            var transaction_details = {
                business_collect_payment : businessId,
                transaction : transactionId
            };
            $mdDialog.show({
                controller: function($scope, $alert, $mdDialog){
                    $scope.title = title;
                    $scope.pay_account_title = pay_account_title;
                    $scope.process_total = process_total;
                    $scope.cash_accounts = cash_accounts;
                    $scope.amount_paid = null;
                    $scope.balance = 0;
                    $scope.transaction_notes = null;
                    $scope.transactionDate = new Date();
                    $scope.selected_payment_option = 0;
                    $scope.payment_options = [];
                    $scope.addPaymentOption = function(){
                        if ($scope.amount_paid == null) $scope.amount_paid = 0;
                        if ($scope.amount_paid > 0 && isArray($scope.cash_accounts) && $scope.cash_accounts.length > 0 && $scope.selected_payment_option >= 0 && $scope.selected_payment_option < $scope.cash_accounts.length){
                            $scope.payment_options.push(freeObj({
                                amount : $scope.amount_paid,
                                id : $scope.cash_accounts[$scope.selected_payment_option].id,
                                account : $scope.cash_accounts[$scope.selected_payment_option].account
                            }));
                            $scope.amount_paid = null;
                            $scope.selected_payment_option = 0;
                            $scope.calcBalance();
                        }
                    };
                    $scope.removePaymentOption = function(pos){
                        if (!isNaN(pos) && isArray($scope.payment_options) && pos >= 0 && pos < $scope.payment_options.length){
                            $scope.payment_options.splice(pos, 1);
                            $scope.calcBalance();
                        }
                    };
                    $scope.calcBalance = function(){
                        var currentAmount = $scope.amount_paid;
                        if (isArray($scope.payment_options)){
                            for (var i = 0; i < $scope.payment_options.length; i ++){
                                var payment_option = $scope.payment_options[i];
                                if (objectHasKeys(payment_option) && payment_option.hasOwnProperty("amount")){
                                    currentAmount += toNumber(payment_option.amount, 0);
                                }
                            }
                        }
                        $scope.balance = $scope.process_total - currentAmount;
                    };
                    $scope.completeTransaction = function(event){
                        var normalizePayments = function(){
                            var items = [];
                            var payments = $scope.payment_options;
                            if ($scope.amount_paid > 0){
                                payments.push(freeObj({
                                    amount : $scope.amount_paid,
                                    id : $scope.cash_accounts[$scope.selected_payment_option].id,
                                    account : $scope.cash_accounts[$scope.selected_payment_option].account
                                }));
                            }
                            for (var i = 0; i < payments.length; i ++){
                                var payment = payments[i];
                                if (payment.hasOwnProperty("id") && isNaN(payment.id) && !emptyString(payment.id)){
                                    items.push({
                                        account : payment.id.toString().trim(),
                                        amount : toNumber(payment.amount, 0)
                                    });
                                }
                            }
                            return items;
                        };
                        transaction_details.transaction_date = $scope.transactionDate.format("dd/MM/yyyy");
                        transaction_details.payments = normalizePayments();
                        transaction_details.notes = $scope.transaction_notes;
                        var wait = $alert.wait("Processing transaction...", event);
                        $appAPI.tQuery(transaction_details, {
                            success : function(data){
                                wait.hide();
                                $scope.complete(data);
                            },
                            error : function(error){
                                wait.hide();
                                $alert.warning("Error Processing", error, event);
                            }
                        });
                    };
                    $scope.hide = function(){
                        $mdDialog.hide();
                    };
                    $scope.cancel = function(){
                        $mdDialog.cancel();
                    };
                    $scope.complete = function(data){
                        $mdDialog.hide(data);
                    };
                },
                templateUrl: "res/business/business_collect_payment.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:false,
                fullscreen: $mdMedia("xs")
            })
            .then(function(journal_id){
                if ("function" === typeof onSuccess) onSuccess();
                var fetch_document = function(type){
                    var wait = $alert.wait("Fetching document details...");
                    var doPrintElement = function(printElement){
                        var printSuccess = PrintElement(camelCase(type), printElement, false);
                        if (!printSuccess){
                            $alert.warning("Error Printing", "Your browser may have disabled popups. Please enable this to avoid further inconveniences", event);
                        }
                    };
                    $appAPI.tQuery({get_sale_transaction_document : journal_id, invoice : (type == "Invoice" ? 1 : 0)},{
                        success : function(data){
                            if (type === "ETR"){
                                $scope.makeETRPrintElement(camelCase("Receipt"), data, function(printElement){
                                    wait.hide();
                                    doPrintElement(printElement);
                                });
                            }
                            else {
                                var business_logo = $rootScope.hasOwnProperty("business") && "object" === typeof $rootScope.business && $rootScope.business.hasOwnProperty("logo") && !emptyString($rootScope.business.logo) ? $rootScope.business.logo : "";
                                $scope.makePrintElement(type, business_logo, data, function(printElement){
                                    wait.hide();
                                    doPrintElement(printElement);
                                });
                            }
                        },
                        error : function(error){
                            wait.hide();
                            $alert.warning("Error fetching document", error);
                        }
                    });
                };
                $mdDialog.show({
                    controller: function($scope, $mdDialog){
                        $scope.cancel = function(){
                            $mdDialog.cancel();
                        };
                        $scope.hide = function(){
                            $mdDialog.hide();
                        };
                        $scope.print = function(type){
                            $mdDialog.hide(type);
                        };
                    },
                    templateUrl: "res/business_sales/business_sale_complete.html",
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: false,
                    fullscreen: false
                })
                .then(function(print_type){
                    fetch_document(print_type);
                });
            });
        };

        //fetching items
        $scope.fetchItems = function(scope, rootScopeKey, responseDataKey, request, onSuccess, onError, onComplete){
            var isLoaded = scope.hasOwnProperty(rootScopeKey) && scope[rootScopeKey].length > 0;
            if (!isLoaded) $scope.setDashLoading(true);
            $appAPI.tQuery(request, {
                success : function(data){
                    var responseData = data;
                    if (!emptyString(responseDataKey) && objectHasKeys(data) && data.hasOwnProperty(responseDataKey) && isArray(data[responseDataKey])){
                        responseData = data[responseDataKey];
                    }
                    if (isLoaded) objectUpdate(scope[rootScopeKey], responseData);
                    else scope[rootScopeKey] = responseData;
                    scope.reapply();
                    if ("function" === typeof onSuccess) onSuccess(data);
                },
                error : function(error, xhr){
                    if ("function" === typeof onError) onError(error, xhr);
                    console.error("Error fetching", error, xhr);
                },
                then : function(){
                    if (!isLoaded) $scope.setDashLoading(false);
                    if ("function" === typeof onComplete) onComplete();
                }
            });
        };

        //etr - invoices - receipts - quotations maker
        $scope.makeETRPrintElement = function(type, journal_data, callback){
            var getDocumentItems = function(){
                var _items = [];
                if (objectHasKeys(journal_data) && journal_data.hasOwnProperty("items") && isArray(journal_data.items)){
                    for (var i = 0; i < journal_data.items.length; i++){
                        var _item = journal_data.items[i];
                        _items.push({
                            type : "tr",
                            children : [
                                {
                                    type : "td",
                                    style : "padding-top: 5px;",
                                    innerHTML : _item.itemname + " @" + Number(_item.selling_price).addCommas() + " x" + _item.qty
                                },
                                {
                                    type : "td",
                                    style : "padding-top: 5px; text-align: right;",
                                    innerHTML : Number(_item.totals_after_tax).addCommas()
                                }
                            ]
                        });
                    }
                }
                if (_items.length > 0){
                    _items.push({
                        type: "tr",
                        children: [
                            {
                                type: "td",
                                colspan: 2,
                                children: [
                                    {
                                        type : "div",
                                        style : "width: 100%; margin: 10px 0 !important; border-bottom: 1px dashed #000;"
                                    }
                                ]
                            }
                        ]
                    });
                }
                return _items;
            };
            var getDocumentTaxDiscount = function(){
                var template_discount = toNumber(dataItem("discount"), 0);
                var template_tax = toNumber(dataItem("total_tax"), 0);
                var _items = [];
                if (template_discount != 0){
                    _items.push({
                        type : "tr",
                        style : "font-weight: bold",
                        children : [
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important;",
                                innerHTML : "Discount"
                            },
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important; text-align: right",
                                innerHTML : Number(template_discount).addCommas()
                            }
                        ]
                    });
                }
                if (template_tax != 0){
                    _items.push({
                        type : "tr",
                        style : "font-weight: bold",
                        children : [
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important;",
                                innerHTML : "Tax"
                            },
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important; text-align: right",
                                innerHTML : Number(template_tax).addCommas()
                            }
                        ]
                    });
                }
                if (_items.length > 0){
                    _items.push({
                        type: "tr",
                        children: [
                            {
                                type: "td",
                                colspan: 2,
                                children: [
                                    {
                                        type : "div",
                                        style : "width: 100%; margin: 10px 0 !important; border-bottom: 1px dashed #000;"
                                    }
                                ]
                            }
                        ]
                    });
                }
                return _items;
            };
            var getDocumentTotals = function(){
                var template_due = toNumber(dataItem("amount_due"), 0);
                var template_paid_real = toNumber(dataItem("payment_amount_real"), 0);
                var template_totals = toNumber(dataItem("totals"), 0);
                var template_balance_text = template_due > 0 ? "Amount Due" : "";
                var template_balance = template_totals <= template_paid_real ? (template_paid_real - template_totals) : template_due;
                return [
                    {
                        type : "tr",
                        style : "font-weight: bold",
                        children : [
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important;",
                                innerHTML : "Totals"
                            },
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important; text-align: right",
                                innerHTML : Number(template_totals).addCommas()
                            }
                        ]
                    },
                    {
                        type : "tr",
                        style : "font-weight: bold",
                        children : [
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important;",
                                innerHTML : "Amount Paid"
                            },
                            {
                                type : "td",
                                style : "padding: 5px 0 0 !important; text-align: right",
                                innerHTML : Number(template_paid_real).addCommas()
                            }
                        ]
                    }
                ];
            };
            var dataItem = function(item){
                if (objectHasKeys(journal_data) && journal_data.hasOwnProperty(item)){
                    return journal_data[item];
                }
                return "";
            };
            var getBusinessItem = function(item){
                if ($rootScope.hasOwnProperty("business") && "object" === typeof $rootScope.business && $rootScope.business != null && $rootScope.business.hasOwnProperty(item)){
                    return $rootScope.business[item];
                }
                return "";
            };
            var getBusinessContacts = function(key, branchId){
                var branches = getBusinessItem("branches");
                if (isArray(branches) && branches.length > 0){
                    var branchPos = 0;
                    var _branch = null;
                    if (!emptyString(branchId)){
                        for (var i = 0; i < branches; i++){
                            _branch = branches[i];
                            if ("object" === typeof _branch && _branch != null && _branch.hasOwnProperty("id") && _branch.id == branchId){
                                branchPos = i;
                                _branch = null;
                                break;
                            }
                            _branch = null;
                        }
                    }
                    if (branches.length > branchPos){
                        _branch = branches[branchPos];
                        if ("object" === typeof _branch && _branch != null && _branch.hasOwnProperty(key)){
                            return _branch[key];
                        }
                    }
                }
                return "";
            };
            var getReference = function(){
                var key = "receipt_reference";
                if (!emptyString(type) && type.trim().toLowerCase() == "invoice") key = "invoice_reference";
                if (!emptyString(type) && type.trim().toLowerCase() == "quotation") key = "quotation_reference";
                return "Reference: " + journal_data.hasOwnProperty(key) ? journal_data[key] : "";
            };
            var getPrintDetails = function(){
                return dataItem("client") + "<br>" +
                    "Print Date: " + (new Date()).format("yyyy-MM-dd") + "<br>" +
                    "Served By: " + dataItem("user") + "<br>" +
                    "Reference: " + getReference()
            };
            var getBusinessContactsArray = function(key){
                var item = getBusinessContacts(key);
                return isArray(item) ? item : [];
            };
            var getBusinessDetails = function(){
                var _items = [];
                var __postal_address = getBusinessContacts("postal_address")
                var __physical_address = getBusinessContacts("physical_address");
                var __phones = getBusinessContactsArray("phones");
                var __emails = getBusinessContactsArray("emails");
                if (!emptyString(__postal_address)) _items.push({
                    type : "p",
                    style : "margin: 2px 0 0 !important; font-weight: bold",
                    innerHTML : "Postal Address: " + __postal_address
                });
                if (!emptyString(__physical_address)) _items.push({
                    type : "p",
                    style : "margin: 2px 0 0 !important; font-weight: bold",
                    innerHTML : "Physical Address: " + __physical_address
                });
                if (isArray(__phones) && __phones.length > 0) _items.push({
                    type : "p",
                    style : "margin: 2px 0 0 !important; font-weight: bold",
                    innerHTML : "Tel: " + __phones.join(", ")
                });
                if (isArray(__emails) && __emails.length > 0) _items.push({
                    type : "p",
                    style : "margin: 2px 0 0 !important; font-weight: bold",
                    innerHTML : "Email: " + __emails.join(", ")
                });
                return _items;
            };
            var getBarcode = function(){
                return {
                    type : "img",
                    src : text2barcodeImage(getReference(), {
                        width: 1,
                        height: 40,
                        font: "consolas",
                        fontSize: 12,
                        format: "CODE128",
                        textMargin: 5,
                        fontOptions: "bold"
                    })
                };
            };
            var template_business_name = getBusinessItem("name");
            var template_business_slogan = getBusinessItem("slogan");
            var template_business_details = getBusinessDetails();
            var template_document_items = getDocumentItems();
            var template_document_items_tax_discount = getDocumentTaxDiscount();
            var template_business_items_totals = getDocumentTotals();
            var template_print_details = getPrintDetails();
            var template_document_footnote = getBusinessItem("receipt_footnote");
            var template_barcode_footer = getBarcode();
            var template = {
                type : "div",
                style : "margin: 0 auto; padding: 10px; max-width: 300px; border: 1px solid #fafafa",
                children : [
                    {
                        type : "table",
                        style : "font-family: 'Consolas', 'Times New Roman', Georgia, Serif; font-size: 12px; width: 100%;",
                        children : [
                            {
                                type : "tbody",
                                children : [
                                    {
                                        type : "tr",
                                        children : [
                                            {
                                                type : "td",
                                                colspan : 2,
                                                children : [
                                                    {
                                                        type : "p",
                                                        style : "margin: 10px 0 20px !important; text-align: center;",
                                                        children : [
                                                            {
                                                                type : "span",
                                                                style : "font-size: 20px; text-transform: uppercase; font-weight: bold;",
                                                                innerHTML : template_business_name
                                                            },
                                                            {
                                                                type : "br"
                                                            },
                                                            {
                                                                type : "em",
                                                                innerHTML : template_business_slogan
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type : "div",
                                                        style : "width: 100%; margin: 10px 0 !important; border-bottom: 1px dashed #000;"
                                                    }
                                                ].concat(template_business_details).concat([
                                                    {
                                                        type : "div",
                                                        style : "width: 100%; margin: 10px 0 !important; border-bottom: 1px dashed #000;"
                                                    }
                                                ])
                                            }
                                        ]
                                    }
                                ].concat(template_document_items).concat(template_document_items_tax_discount).concat(template_business_items_totals).concat([
                                    {
                                        type: "tr",
                                        children: [
                                            {
                                                type: "td",
                                                colspan: 2,
                                                style: "text-align: center",
                                                children: [
                                                    {
                                                        type : "div",
                                                        style : "width: 100%; margin: 10px 0 !important; border-bottom: 1px dashed #000;"
                                                    },
                                                    {
                                                        type : "p",
                                                        style : "margin: 10px 0 !important; text-align: left;",
                                                        innerHTML : template_print_details
                                                    },
                                                    {
                                                        type : "p",
                                                        style : "margin: 10px 0 !important; font-weight: bold;",
                                                        innerHTML : template_document_footnote
                                                    }
                                                ].concat(template_barcode_footer)
                                            }
                                        ]
                                    }
                                ])
                            }
                        ]
                    }
                ]
            };
            if ("function" === typeof callback) callback(makeElement(template));
        };

        //invoices - receipts - quotations maker
        $scope.makePrintElement = function(type, logo, journal_data, callback){
            var create = function(logoData){
                var template_items = function(){
                    var _items = [];
                    if (objectHasKeys(journal_data) && journal_data.hasOwnProperty("items") && isArray(journal_data.items)){
                        for (var i = 0; i < journal_data.items.length; i++){
                            var _item = journal_data.items[i];
                            _items.push({
                                type : "tr",
                                style : "border-bottom: 1px solid #ddd; background: #fff; font-size: 12px;",
                                children : [
                                    {
                                        type : "td",
                                        style : "padding: 5px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;",
                                        innerHTML : _item.itemname
                                    },
                                    {
                                        type : "td",
                                        style : "padding: 5px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;",
                                        innerHTML : _item.qty
                                    },
                                    {
                                        type : "td",
                                        style : "padding: 5px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;",
                                        innerHTML : Number(_item.selling_price).addCommas()
                                    },
                                    {
                                        type : "td",
                                        style : "padding: 5px; border-bottom: 1px solid #ddd;",
                                        innerHTML : Number(_item.totals_after_tax).addCommas()
                                    }
                                ]
                            });
                        }
                    }
                    return _items;
                };
                var dataItem = function(item){
                    if (objectHasKeys(journal_data) && journal_data.hasOwnProperty(item)){
                        return journal_data[item];
                    }
                    return "";
                };
                var getBusinessItem = function(item){
                    if ($rootScope.hasOwnProperty("business") && "object" === typeof $rootScope.business && $rootScope.business != null && $rootScope.business.hasOwnProperty(item)){
                        return $rootScope.business[item];
                    }
                    return "";
                };
                var getBusinessContacts = function(key, branchId){
                    var branches = getBusinessItem("branches");
                    if (isArray(branches) && branches.length > 0){
                        var branchPos = 0;
                        var _branch = null;
                        if (!emptyString(branchId)){
                            for (var i = 0; i < branches; i++){
                                _branch = branches[i];
                                if ("object" === typeof _branch && _branch != null && _branch.hasOwnProperty("id") && _branch.id == branchId){
                                    branchPos = i;
                                    _branch = null;
                                    break;
                                }
                                _branch = null;
                            }
                        }
                        if (branches.length > branchPos){
                            _branch = branches[branchPos];
                            if ("object" === typeof _branch && _branch != null && _branch.hasOwnProperty(key)){
                                return _branch[key];
                            }
                        }
                    }
                    return "";
                };
                var getReference = function(){
                    var key = "receipt_reference";
                    if (!emptyString(type) && type.trim().toLowerCase() == "invoice") key = "invoice_reference";
                    if (!emptyString(type) && type.trim().toLowerCase() == "quotation") key = "quotation_reference";
                    return "Reference: " + journal_data.hasOwnProperty(key) ? journal_data[key] : "";
                };
                var getToDetails = function(){
                    var details = "To. <strong>" + dataItem("client") + "</strong><br>"
                        + "Transaction Date: <strong>" + dataItem("date") + "</strong><br>"
                        + "Print Date: <strong>" + (new Date()).format("yyyy-MM-dd") + "</strong><br>";
                    if (!emptyString(type) && type.trim().toLowerCase() == "invoice"){
                        var amount_totals = toNumber(dataItem("totals"), 0);
                        var amount_paid = toNumber(dataItem("payment_amount"), 0);
                        var amount_due = amount_totals - amount_paid;
                        details += "Amount Paid: <strong>" + amount_paid.addCommas() + "</strong><br>"
                            + "Amount Due: <strong>" + amount_due.addCommas() + "</strong><br>";
                    }
                    return details;
                };
                var getBusinessContactsArray = function(key){
                    var item = getBusinessContacts(key);
                    return isArray(item) ? item : [];
                };
                var getBusinessDetails = function(){
                    return "PIN: <strong>" + getBusinessItem("pin") + "</strong><br>"
                        + "Postal: <strong>" + getBusinessContacts("postal_address") + "</strong><br>"
                        + "Email: <strong>" + getBusinessContactsArray("emails").join(", ") + "</strong>";
                };
                var getBusinessFooter = function(){
                    var physical_address = getBusinessContacts("physical_address");
                    var emails_array = getBusinessContactsArray("emails");
                    var phones_array = getBusinessContactsArray("phones");
                    var online_array = getBusinessContactsArray("websites").concat(getBusinessContactsArray("socials"));
                    var document_footnote = getBusinessItem("receipt_footnote");
                    if (!emptyString(type) && type.trim().toLowerCase() == "invoice") document_footnote = getBusinessItem("invoice_footnote");
                    if (!emptyString(type) && type.trim().toLowerCase() == "quotation") document_footnote = getBusinessItem("quotation_footnote");
                    var footer = "<strong>" + getBusinessItem("name") + " | " + getBusinessContacts("name") + "</strong><br><p style='margin: 0 !important;'>";
                    if (!emptyString(physical_address)) footer += "| Physical Address: " + physical_address;
                    if (emails_array.length > 0) footer += "| Emails: " + emails_array.join(", ");
                    if (phones_array.length > 0) footer += "| Phone Contacts: " + phones_array.join(", ");
                    if (online_array.length > 0) footer += "| Online Links: " + online_array.join(", ");
                    footer += "</p>";
                    if (!emptyString(document_footnote)) footer += "<p style='font-size: 14px; font-weight: bold;'>" + document_footnote + "</p>";
                    return footer;
                };
                var template_logo = logoData;
                var template_business_name = getBusinessItem("name");
                var template_business_details = getBusinessDetails();
                var template_type = camelCase(type);
                var template_reference = getReference();
                var template_to_details = getToDetails();
                var template_discount = toNumber(dataItem("discount"), 0);
                var template_tax = toNumber(dataItem("total_tax"), 0);
                var template_totals = toNumber(dataItem("totals"), 0);
                var template_business_footer = getBusinessFooter();
                var template = {
                    type : "div",
                    style : "max-width: 800px; min-width: 500px; font-family: Arial; background: #fefefe; border: 1px solid #ddd",
                    children : [
                        {
                            type: "div",
                            style: "height: 10px; background: #009688;"
                        },
                        {
                            type : "table",
                            cellpadding : 0,
                            cellspacing : 0,
                            border : 0,
                            style : "width:100%",
                            children : [
                                {
                                    type : "tr",
                                    children : [
                                        {
                                            type : "td",
                                            valign : "top",
                                            style : "padding: 10px;",
                                            children : [
                                                {
                                                    type : "img",
                                                    src : template_logo,
                                                    style : "background: #fff; width: 200px; border-radius: 4px;" + (template_logo.trim().length < 1 ? " display: none;" : "")
                                                },
                                                {
                                                    type : "div",
                                                    style : "margin-top: 10px;",
                                                    children : [
                                                        {
                                                            type : "h2",
                                                            style : "padding: 5px;margin: 0 !important;font-size: 14px;",
                                                            innerHTML : template_business_name
                                                        },
                                                        {
                                                            type : "p",
                                                            style : "font-size: 12px; padding: 5px; margin: 0 !important;",
                                                            innerHTML : template_business_details
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type : "td",
                                            valign : "top",
                                            style : "text-align: right; padding: 10px;",
                                            children : [
                                                {
                                                    type : "h2",
                                                    style : "padding: 5px;margin: 0 !important;font-size: 20px;",
                                                    innerHTML : template_type
                                                },
                                                {
                                                    type : "h2",
                                                    style : "padding: 5px;margin: 0 !important;font-size: 14px;",
                                                    innerHTML : template_reference
                                                },
                                                {
                                                    type : "p",
                                                    style : "margin: 0 !important;margin-top: 10px;font-size: 12px;padding: 5px;",
                                                    innerHTML : template_to_details
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "tr",
                                    children : [
                                        {
                                            type : "td",
                                            valign : "top",
                                            colspan : 2,
                                            style : "padding: 15px;",
                                            children : [
                                                {
                                                    type : "table",
                                                    cellpadding : 5,
                                                    cellspacing : 0,
                                                    border : 0,
                                                    style : "width: 100%; border: 1px solid #009688;",
                                                    children : [
                                                        {
                                                            type : "tr",
                                                            style : "background: #009688;color: #fff;text-align: left;",
                                                            children : [
                                                                {
                                                                    type : "th",
                                                                    style : "padding: 5px; font-size: 14px; border-right: 1px solid #00887b;",
                                                                    innerHTML : "Item"
                                                                },
                                                                {
                                                                    type : "th",
                                                                    style : "padding: 5px; font-size: 14px; border-right: 1px solid #00887b;",
                                                                    innerHTML : "Quantity"
                                                                },
                                                                {
                                                                    type : "th",
                                                                    style : "padding: 5px; font-size: 14px; border-right: 1px solid #00887b;",
                                                                    innerHTML : "Unit Price"
                                                                },
                                                                {
                                                                    type : "th",
                                                                    style : "padding: 5px; font-size: 14px;",
                                                                    innerHTML : "Total"
                                                                }
                                                            ]
                                                        }
                                                    ].concat(template_items()).concat([
                                                        {
                                                            type : "tr",
                                                            children : [
                                                                {
                                                                    type : "td",
                                                                    colspan : 4,
                                                                    style : "padding: 0px; border-top:2px solid #ddd"
                                                                }
                                                            ]
                                                        }
                                                     ].concat(template_discount <= 0 ? [] : [
                                                        {
                                                            type : "tr",
                                                            style : "font-weight: bold; border-bottom: 1px solid #ddd; background: #fff; font-size: 12px;",
                                                            children : [
                                                                {
                                                                    type : "td",
                                                                    colspan : 3,
                                                                    style : "text-align: right; padding: 5px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;",
                                                                    innerHTML : "Discount"
                                                                },
                                                                {
                                                                    type : "td",
                                                                    style : "padding: 5px; border-bottom: 1px solid #ddd;",
                                                                    innerHTML : template_discount
                                                                }
                                                            ]
                                                        }
                                                    ]).concat(template_tax <= 0 ? [] : [
                                                        {
                                                            type : "tr",
                                                            style : "font-weight: bold; border-bottom: 1px solid #ddd; background: #fff; font-size: 12px;",
                                                            children : [
                                                                {
                                                                    type : "td",
                                                                    colspan : 3,
                                                                    style : "text-align: right; padding: 5px; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;",
                                                                    innerHTML : "Tax"
                                                                },
                                                                {
                                                                    type : "td",
                                                                    style : "padding: 5px; border-bottom: 1px solid #ddd;",
                                                                    innerHTML : template_tax
                                                                }
                                                            ]
                                                        }
                                                     ]).concat([
                                                        {
                                                            type : "tr",
                                                            style : "font-weight: bold; border-bottom: 1px solid #ddd; background: #fff; font-size: 12px;",
                                                            children : [
                                                                {
                                                                    type : "td",
                                                                    colspan : 3,
                                                                    style : "text-align: right; padding: 5px; border-right: 1px solid #ddd;",
                                                                    innerHTML : "Totals"
                                                                },
                                                                {
                                                                    type : "td",
                                                                    style : "padding: 5px;",
                                                                    innerHTML : template_totals
                                                                }
                                                            ]
                                                        }
                                                    ]))
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type : "tr",
                                    children : [
                                        {
                                            type : "td",
                                            colspan : 2,
                                            style : "padding: 15px; text-align: center; font-size: 12px",
                                            innerHTML : template_business_footer
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
                if ("function" === typeof callback) callback(makeElement(template));
            };
            if (!emptyString(logo)) toDataUrl(logo, create, "image/png");
            else create("");
            //logo = ! ? logo : "";
            
        };

        //deleting items
        $scope.onDeleteToast = function(event, deleteObject, undoKey, onDelete, onUndo){
            $alert.confirm("Delete Item", "Are you sure you want to delete this item?", "Yes", event, function(){
                var wait = $alert.wait("Deleting item...", event);
                $appAPI.tQuery(deleteObject, {
                    success : function(data){
                        onDelete();
                        $alert.toast("You have deleted an item successfully.", 8000, "bottom right", "Undo", function(){
                            var request = {}; request[undoKey] = data;
                            $appAPI.tQuery(request, {
                                success : function(data){
                                    $alert.toast(data, 2000, "bottom right");
                                    onUndo();
                                },
                                error : function(error){
                                    $alert.toast(error, 2000, "bottom right");
                                }
                            });
                        });
                    },
                    error : function(error){
                        $alert.warning("Error Deleting.", error);
                    },
                    then : function(){
                        wait.hide();
                    }
                });
            });
        };
        //self init
        $scope.refreshBusinessDetails();
    }

})();