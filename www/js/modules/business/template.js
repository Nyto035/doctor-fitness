(function(){

	angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider) {
        $sessionProvider.addProtectedState("dashboard.template");
        $stateProvider.state("dashboard.business.print", {
            url: "/print/:from/:type/:journalId",
            templateUrl: "res/business/template.html",
            controller: templateCtrl
        });
    }]);

    function templateCtrl($rootScope, $scope, $alert, $router, $appAPI, $stateParams, $mdDialog, $mdMedia){
    	$rootScope.businessId = $stateParams.businessId;
		
    	$scope.from = $stateParams.from;
    	$scope.type = $stateParams.type;
    	$scope.journalId = $stateParams.journalId;
    	$scope.valid = false;
    	$scope.document = null;
		$scope.logo=$rootScope.business.logo;
    	$scope.today = new Date().format("dd/MM/yyyy");
    	$scope.footnote = "Thank you for business";
    	$rootScope.$watch("business", function(){
    		if ($rootScope.business != null){
    			var footnote = $scope.type == "invoice" ? $rootScope.business.invoice_footnote : $rootScope.business.receipt_footnote;
    			if ("string" === typeof footnote && footnote.length > 0){
    				$scope.footnote = footnote;
    				$scope.reapply();
    			}
    		}
    	});
    	$scope.typeName = $scope.type == "invoice" ? "INVOICE" : $scope.type == "receipt" ? "RECEIPT" : "Mini Receipt";
    	if ("string" === typeof $scope.type && ["etr", "invoice", "receipt"].indexOf($scope.type) < 0 || ["sales", "purchases"].indexOf($scope.from) < 0){
    		$router.go("dashboard.business");
    	}
    	else $scope.valid = true;
    	$scope.goBack = function(){
    		if ($scope.from == "sales") $router.go("dashboard.business.business_sales", {tab : 1});
    		else $router.go("dashboard.business.business_purchases", {tab : 1});
    	}
    	$scope.fetchDocument = function(){
    		$appAPI.tQuery({get_sale_transaction_document : $scope.journalId, invoice : ($scope.type == "invoice" ? 1 : 0)},{
                success : function(data){
                	$scope.document = data;
                	$scope.reapply();
                },
                error : function(error){
                    $alert.warning("Error fetching document", error);
                    $scope.goBack();
                }
            });
    	};
    	$scope.printDocument = function(event){
    		var document_wrappers = document.querySelectorAll("#document_wrapper");
    		if (document_wrappers.length > 0){
    			var document_wrapper = document_wrappers[0];
    			var frame_html = "<style type='text/css'>@media print { @page { size: " + (document_wrapper.offsetWidth + 50) + "px " + (document_wrapper.offsetHeight + 50) + "px; margin:0 -6cm; } html { margin: 0 6cm; }}</style>";
    			frame_html += document_wrapper.outerHTML;    			
    			var frame = document.createElement("iframe");
    			frame.id = "document_wrapper_frame";
    			frame.height = 0;
    			frame.width = 0;
    			document.querySelector("body").appendChild(frame);
    			var frameReady = setInterval(function(){
    				var wrapper_frame = document.querySelector("#document_wrapper_frame");
    				if (wrapper_frame != null){
    					clearInterval(frameReady);
    					document.querySelector("#document_wrapper_frame").contentWindow.document.write(frame_html);
    					document.querySelector("#document_wrapper_frame").contentWindow.focus();
    					document.querySelector("#document_wrapper_frame").contentWindow.print();
    					document.querySelector("#document_wrapper_frame").remove();
    				}
    			}, 10);
    		}
    	};
    	$scope.emailDocument = function(event){
    		var document_type = $scope.type;
    		var document_html = $scope.getDocumentHTML();
            var businessId = $rootScope.businessId;
    		$mdDialog.show({
                controller: function($rootScope, $scope, $mdDialog, $alert, $appAPI, $session){
                	$scope.businessId = businessId;
                    $scope.type = document_type;
                	$scope.html = document_html;
                	$scope.email = null;
                	$scope.message = null;
                	$scope.subject = camelCase(document_type);
                	$scope.send = function(event){
                		var params  = {
                            business : $scope.businessId,
                			email : $scope.email,
                			subject : $scope.subject,
                			message : $scope.message,
                			email_document_html : $scope.html
                		};
                		var wait = $alert.wait("Sending message...", event);
                		$appAPI.tQuery(params, {
                			success : function(data){
                				wait.hide();
                				$scope.complete(data);
                			},
                			error : function(error){
                				wait.hide();
                				$alert.warning("Email Error!", error, event);
                			}
                		});
                	}

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
                templateUrl: "res/business/template_email.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(function(data){
            	$alert.success("Success!", "Your message is on its way.. may take at most 5 minutes", event);
            });
    	};

    	$scope.getDocumentHTML = function(){
    		var document_wrappers = document.querySelectorAll("#document_wrapper");
    		if (document_wrappers.length > 0){
    			var d = document.createElement("div");
    			d.width = 0; d.height = 0;
    			document.querySelector("body").appendChild(d);
    			var cloned_document_wrapper = document_wrappers[0].cloneNode(true);
    			d.appendChild(cloned_document_wrapper);
    			var copyStyles = function(from, to){
    				var nodeName = from.nodeName.toLowerCase();
    				var style = from.style.cssText;    				
    				if (style.length > 0) to.style = style;
    				if (["tr", "td", "th"].indexOf(nodeName) > -1){
    					var fs = window.getComputedStyle(from, null);
    					to.style.fontSize = fs.fontSize;
    					to.style.fontFamily = fs.fontFamily;
    					to.style.background = fs.background;
    					to.style.border = fs.border;
    					to.style.borderRight = fs.borderRight;
    					to.style.borderLeft = fs.borderLeft;
    					to.style.borderBottom = fs.borderBottom;
    					to.style.padding = fs.padding;
    					to.style.textAlign = fs.textAlign;
    				}
    				if (nodeName == "table"){
    					to.setAttribute("cellpadding", 0);
    					to.setAttribute("cellspacing", 0);
    					to.setAttribute("border", 0);
    				}
    				if (nodeName == "td") to.setAttribute("valign", "top");
    			};
    			var cloneElem = function(from){
    				if (from.nodeType == 1){
    					var nodeName = from.nodeName.toLowerCase();
						var elem = document.createElement(nodeName);
	    				if (["strong", "thead", "br", "tbody"].indexOf(nodeName) < 0) copyStyles(from, elem);
	    				for (var i = 0; i < from.childNodes.length; i ++){
		    				var child = from.childNodes[i];
		    				if (child.nodeType == 3) elem.appendChild(child);
		    				else if (child.nodeType == 1 && child.nodeName.toLowerCase() != "style") elem.appendChild(cloneElem(child));	    				
		    			}
		    			return elem;			
    				}
    				return null;
    			};
    			var main = cloneElem(cloned_document_wrapper);
    			main.style = "border: 1px solid #eee; width: 620px; padding: 40px; background: rgb(255, 255, 255); font-family: Helvetica, Arial;";
    			var main_html = main.outerHTML;
   				d.remove();
    			return main_html;	
    		}
    		return "";
    	};

    	//self init
    	if ($scope.valid) $scope.fetchDocument();

    }
	

})();