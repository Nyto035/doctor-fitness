(function(){

    angular.module(APPLICATION_MODULE).run(["$rootScope", "$router", function($rootScope, $router){
        $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
            if (toState.name === "dashboard") $router.go("dashboard.businesses");
            $rootScope.$broadcast("dashboard-navigation-done", {stateRef : toState.name});
        });
        $rootScope.isMainLoading = false;
    }]);

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function($stateProvider, $sessionProvider){
        $sessionProvider.addProtectedState("dashboard");
        $stateProvider.state("dashboard", {
            url: "/my",
            templateUrl: "res/dashboard/dashboard.html",
            controller: dashboardCtrl
        });
    }]);

    function dashboardCtrl($rootScope, $scope, $appAPI, $mdSidenav, $mdDialog, $mdMedia, $state){
        $rootScope.setTitle("Eko Biashara | My Biashara");
        $rootScope.setMainLoading(false);
        $scope.dashboardTitle = null;
        $scope.setDashboardTitle = function(title){
            $scope.dashboardTitle = title;
            $scope.reapply();
        };
        $scope.logo_placeholder = "res/images/logo_placeholder.jpg";
        $scope.avatar_placeholder = "res/images/avatar_placeholder.png";
        $scope.sideNavLogo = $scope.logo_placeholder;
        $scope.setSideNavLogo = function(src){
            if (emptyString(src)) src = $scope.logo_placeholder;
            $scope.sideNavLogo = src;
            $scope.reapply();
        };
        $scope.sideNavLinks = [];
        $scope.setSideNavLinks = function(links, clear){
            if (clear) $scope.sideNavLinks = [];
            $scope.sideNavLinks = $scope.sideNavLinks.concat(links);
            $scope.setSideNavActive();
        };
        $scope.setSideNavActive = function(currentState){
            if (emptyString(currentState) && objectHasKeys($state) && $state.hasOwnProperty("current") && $state.current.hasOwnProperty("name")){
                currentState = $state.current.name;
            }
            if (isArray($scope.sideNavLinks)){
                for (var i = 0; i < $scope.sideNavLinks.length; i ++){
                    var link = $scope.sideNavLinks[i];
                    link.isActive = link.hasOwnProperty("stateRef") && link.stateRef === currentState;
                }
            }
            $scope.reapply();
        };
        $scope.openSideNavPanel = function(){
            $mdSidenav('left').open();
        };
        $scope.closeSideNavPanel = function(){
            $mdSidenav('left').close();
        };
        $scope.lockedSideNav = true;
        $scope.displayGtSm = $mdMedia('gt-sm');
        $scope.toggleSidenav = function(menuId){
            if ($scope.displayGtSm) $scope.lockedSideNav = !$scope.lockedSideNav;
            else $mdSidenav(menuId).toggle();
            $scope.reapply();
        };
        $scope.$watch(function() { return $mdMedia('gt-sm'); }, function(gtSm) {
            $scope.displayGtSm = gtSm;
            $scope.reapply();
        });
        $scope.uploadCropImage = function(event, onSuccess){
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
                    $scope.croppieInstance = null;
                    $scope.ImageUploaderReady = false;
                    $scope.initCroppie = function(croppieElement){
                        $scope.croppieInstance = new Croppie(croppieElement, {
                            customClass : "eko-croppie",
                            enableOrientation : true,
                            viewport: {
                                width: 250,
                                height: 150,
                                type: "square"
                            },
                            boundary: {
                                width: 350,
                                height: 200
                            }
                        });
                    };
                    $scope.onReady = function(callback){
                        var croppieElement = null, fileUpload = null;
                        var listener = setInterval(function(){
                            croppieElement= document.getElementById("image_uploader_crop");
                            fileUpload = document.getElementById("image_uploader_file");
                            if (isElement(croppieElement) && isElement(fileUpload)){
                                clearInterval(listener);
                                if ("function" === typeof callback) callback(croppieElement, fileUpload);
                            }
                        }, 50);
                    };
                    $scope.uploadImage = function(){};
                    $scope.imageUploaderRotate = function(deg){
                        if ($scope.croppieInstance !== null){
                            $scope.croppieInstance.rotate(deg);
                        }
                    };
                    $scope.getImageUploaderImage = function(event){
                        if ($scope.croppieInstance !== null && $scope.ImageUploaderReady){
                            var wait = $alert.wait("Cropping image...", event);
                            setTimeout(function(){
                                $scope.croppieInstance.result("canvas").then(function(result){
                                    wait.hide();
                                    $scope.success(result);
                                });
                            }, 500);
                        }
                        else $alert.danger("Error Cropping Image", "There was a problem getting the cropped image. Please reload the page and try again.", event);
                    };
                    $scope.onReady(function(croppieElement, fileUpload){
                        if (isElement(croppieElement) && isElement(fileUpload)){
                            $scope.initCroppie(croppieElement);
                            fileUpload.addEventListener("change", function(event){
                                var input = this;
                                if (input.files && input.files[0]){
                                    $scope.ImageUploaderReady = false;
                                    var reader = new FileReader();
                                    var wait = $alert.wait("Loading image...", event);
                                    reader.onload = function(e){
                                        if ($scope.croppieInstance != null){
                                            $scope.croppieInstance.bind({
                                                url: e.target.result
                                            });
                                            $scope.ImageUploaderReady = true;
                                            $scope.$apply();
                                        }
                                        wait.hide();
                                    };
                                    reader.readAsDataURL(input.files[0]);
                                }
                            });
                            $scope.uploadImage = function(){
                                fileUpload.click();
                            };
                        }
                    });
                },
                templateUrl: "res/dashboard/image_uploader.html",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: $mdMedia("xs")
            }).then(onSuccess);
        };
        $scope.dashboardLoading = true;
        $scope.setDashLoading = function(isLoading){
            $scope.dashboardLoading = isLoading;
        };
		$scope.billBusiness = function(business){
			//var bill_business = "object" === typeof business && business != null &&  business.hasOwnProperty("id") && business.id == "61839dfab0a3e44dc5cc2d4fff349f8d26c55073";
			var bill_business = "object" === typeof business && business != null && business.hasOwnProperty("billing") && "object" === typeof business.billing;
			if (bill_business){
				$state.go("dashboard.billing", {businessId : business.id});
				return true;
			}
			return false;
		};
        $scope.$on("dashboard-navigation-done", function(event, args){
            if (objectHasKeys(args) && args.hasOwnProperty("stateRef")){
                $scope.setSideNavActive(args.stateRef);
            }
        });
        $scope.$on("session_lock", function(){
            $appAPI.tQuery({lock_session : 1}, {
                success : function(data){
                    console.info("Session silently locked: ", data);
                },
                error : function(error, xhr){
                    console.error("Error silently locking server session: ", error, xhr);
                }
            });
        });
        $scope.$on("session_logout", function(){
            $appAPI.tQuery({logout_session : 1}, {
                success : function(data){
                    $appAPI.removeToken();
                    console.info("Session silently logged off: ", data);
                },
                error : function(error, xhr){
                    console.error("Error silently logging off server session: ", error, xhr);
                }
            });
        });
        $rootScope.business = null;
    }

})();