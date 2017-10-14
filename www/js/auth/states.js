(function () {
    "use strict";

    angular.module("providerPortal.auth.states", [])

    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider

        .state("auth_login", {
            data: {
                requireUser: false
            },
            cache: false,
            parent: "app",
            url: "/login/?reset_password&" +
            "reset_password_confirm&change_pwd&timeout",
            views: {
                'content': {
                    templateUrl: 'templates/login.html',
                    controller: "providerPortal.auth.controllers.loginAuth"
                },
                'fabContent': {
                    template: ''
                }
            }
        })

        .state("auth_logout", {
            data: {
                requireUser: false
            },
            cache: false,
            parent: "portal",
            url: "/logout/?timeout&change_pwd",
            views: {
                'content': {
                    templateUrl: 'templates/login.html',
                    controller: "providerPortal.auth.controllers.logoutAuth"
                },
                'fabContent': {
                    template: ''
                }
            }
        });
    }]);

})();
