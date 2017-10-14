(function(){

    angular.module(APPLICATION_MODULE).config(["$stateProvider", function($stateProvider){
        $stateProvider.state("home", {
            url: "/",
            templateUrl: "res/home/home.html",
            controller: homeCtrl
        });
    }]);

    function homeCtrl($rootScope, $scope, $mdSidenav, $appAPI, $alert, $session, $router){
        var animate = function(opts){
            var start = new Date;
            var id = setInterval(function(){
                var timePassed = new Date - start;
                var progress = timePassed / opts.duration;
                if (progress > 1) progress = 1;
                var delta = opts.delta(progress);
                opts.step(delta);
                if (progress == 1) clearInterval(id);
            }, opts.delay || 10);
            return id;
        };
        var easeOutCubic = function(t){ return (--t)*t*t+1; };
        $scope.scrollInterval = null;
        $scope.scroll_to = function(id, hideSideNav, defaultNav){
            var elem = document.getElementById(id);
            var scrollElement = document.getElementsByTagName("md-content")[1];
            var initialOffset = scrollElement.scrollTop;
            var diff = elem.offsetTop - initialOffset;
            var scrollBack = diff < 0;
            if ($scope.scrollInterval != null) clearInterval($scope.scrollInterval);
            $scope.scrollInterval = animate({
                delay: 10,
                duration: 1000,
                delta: easeOutCubic,
                step: function(delta){
                    if ($scope.scrollInterrupt){
                        $scope.scrollInterrupt = false;
                    }
                    var step = (scrollBack ? diff * -1 : diff) * delta;
                    scrollElement.scrollTop = scrollBack ? initialOffset - step : initialOffset + step;
                }
            });
            if ("boolean" === typeof hideSideNav && hideSideNav){
                $scope.closeSideNavPanel();
            }
            $scope.defaultNav = defaultNav || id;
            $scope.reapply();
        };
        $rootScope.setTitle($session.settings.defaultHomeTitle);
        $scope.defaultNav = "home";$scope.openSideNavPanel = function() {
            $mdSidenav('left').open();
        };
        $scope.closeSideNavPanel = function() {
            $mdSidenav('left').close();
        };

        $scope.auth = {login_email_session : null, password : null};
        $scope.login = function(event){
            if (emptyString($scope.auth.login_email_session) || emptyString($scope.auth.password)){
                $alert.warning("Incomplete", "Please enter your credentials to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Signing in...", event);
            $appAPI.query($scope.auth, {
                success : function(data){
                    $appAPI.saveToken(data.token);
                    $rootScope.session = data;
                    $router.go($session.settings.sessionState, $session.settings.sessionStateParams);
                },
                error : function(error, xhr){
                    console.error("Login error", error, xhr);
                    $alert.warning("Login Error", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.user = {phone : null, register_user_by_email : null, password : null, password_confirm : null};
        $scope.register = function(event){
            if (emptyString($scope.user.register_user_by_email) || emptyString($scope.user.password) || emptyString($scope.user.phone)){
                $alert.warning("Incomplete", "Please fill in the registration form to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Creating your new account...", event);
            $appAPI.query($scope.user, {
                success : function(data){
                    $alert.success("Registration Success!", data, event);
                },
                error : function(error, xhr){
                    console.error("Registration error", error, xhr);
                    $alert.warning("Registration Error", error, event);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.features = [
            {
                icon : "access_time",
                title : "Tracking Daily Transactions",
                info : "Digitized tracking of your sales and operating costs from wherever you are."
            },
            {
                icon : "speaker_notes",
                title : "Quotations",
                info : "Create and send professional quotations easily and quickly."
            },
            {
                icon : "email",
                title : "Invoicing",
                info : "Invoice your customers, and track their payments."
            },
            {
                icon : "receipt",
                title : "Receipting",
                info : "Send your customers receipts when their payments are complete."
            },
            {
                icon : "add_shopping_cart",
                title : "Inventory + Stock Control",
                info : "Track your goods in and out of your business."
            },
            {
                icon : "people",
                title : "Multi User and Access Levels",
                info : "Multiple users per business, with multi level access."
            },
            {
                icon : "timeline",
                title : "Audit Trail",
                info : "All transactions are recorded and tracked."
            },
            {
                icon : "book",
                title : "Book keeping",
                info : "Automated accounting with financial reports."
            }
        ];
        $rootScope.pricing = $rootScope.hasOwnProperty("pricing") ? $rootScope.pricing : [];
        $scope.fetchPricing = function(){
            var isLoaded = $rootScope.hasOwnProperty("pricing") && $rootScope.pricing.length > 0;
            $appAPI.query({get_plans : 1}, {
                success : function(data){
                    if (isLoaded) objectUpdate($rootScope.pricing, data);
                    else $rootScope.pricing = data;
                    $rootScope.reapply();
                },
                error : function(error, xhr){
                    console.error("Pricing details fetch error: ", error, xhr);
                },
                then : function(){}
            });
        };
        $scope.other_contacts = [
            {
                icon : "phone",
                title : "Call Us",
                text : "+254 20 803 0237"
            },
            {
                icon : "mail_outline",
                title : "Email Us",
                text : "info@ekobiashara.com"
            },
            {
                icon : "markunread_mailbox",
                title : "Or, Post A Letter",
                text : "P.O. Box 41885 - 00100 Nairobi, Kenya"
            }
        ];
        $scope.contact = {process_contact_form_email : null, subject : null, message : null};
        $scope.sendMessage = function(event){
            if (emptyString($scope.contact.process_contact_form_email) || emptyString($scope.contact.subject) || emptyString($scope.contact.message)){
                $alert.warning("Error!", "Please fill in contact form to continue", event);
                event.preventDefault();
                return;
            }
            var wait = $alert.wait("Sending your message...");
            $appAPI.query($scope.contact, {
                success : function(data){
                    $alert.success("Success!", data);
                },
                error : function(error, xhr){
                    console.error("Contacts form emailing error: ", error, xhr);
                    $alert.warning("Mailing Error", error);
                },
                then : function(){
                    wait.hide();
                }
            });
        };
        $scope.showTerms = function(closeSideNav){};
        $scope.goHome = function(){
            if ($rootScope.isAuthenticated()){
                $router.go($session.settings.sessionState, $session.settings.sessionStateParams);
            }
            else {
                $scope.scroll_to("login", false, "home");
                $alert.toast("You need to sign up or login to access your dashboard", 5000, "top right");
            }
        };

        $scope.terms = function(event){

        };

        //self init
        $scope.fetchPricing();
    }

})();