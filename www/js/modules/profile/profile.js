(function() {

    angular.module(APPLICATION_MODULE).config(["$stateProvider", "$sessionProvider", function ($stateProvider, $sessionProvider) {
        $sessionProvider.addProtectedState("dashboard.profile");
        $stateProvider.state("dashboard.profile", {
            url: "/profile",
            templateUrl: "res/profile/profile.html",
            controller: profileCtrl
        });
    }]);

    function profileCtrl($rootScope, $scope, $alert, $appAPI, $router){
        $scope.setDashboardTitle("My Profile");
        $scope.setSideNavLogo("res/images/bgimage.jpg");
        $scope.setSideNavLinks([
            {
                icon : "business",
                name : "My Businesses",
                separator : false,
                stateRef : "dashboard.businesses"
            }
        ], true);
        $scope.setDashLoading(false);
        $scope.new_names = $rootScope.session.names;
        $scope.new_login_email = $rootScope.session.email;
        $scope.new_password = null;
        $scope.new_password_confirm = null;
        $scope.changeAvatar = function(event){
            console.log("Change avatar!", event);
            //edit_profile_avatar
        };
        $scope.saveNames = function(event){
            if (emptyString($scope.new_names)){
                $alert.warning("Error!", "Please enter a name to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Saving names...", event);
            $appAPI.tQuery({edit_profile_names : $scope.new_names}, {
                success : function(data){
                    $alert.success("Success!", data, event);
                },
                error : function(error){
                    $alert.warning("Error saving!", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.saveEmail = function(event){
            if (emptyString($scope.new_login_email)){
                $alert.warning("Error!", "Please enter a valid email to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Saving new login email...", event);
            $appAPI.tQuery({change_login_email : $scope.new_login_email}, {
                success : function(data){
                    $alert.success("Success!", data, event);
                },
                error : function(error){
                    $alert.warning("Error saving!", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.savePassword = function(event){
            if (emptyString($scope.new_password) || emptyString($scope.new_password_confirm)){
                $alert.warning("Error!", "Please enter valid password details to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Saving new login password...", event);
            $appAPI.tQuery({change_login_password : $scope.new_password, password_confirm : $scope.new_password_confirm}, {
                success : function(data){
                    $alert.success("Success!", data, event);
                },
                error : function(error){
                    $alert.warning("Error saving!", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
    }

})();