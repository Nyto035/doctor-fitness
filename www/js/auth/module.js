(function () {
    "use strict";
    //let ekobiashara_server = "https://127.0.0.1/oldapi/api_provider/index.php";
    // var ekobiashara_server = "https://ekobiashara.com/dev2/api_provider/index.php";
    var ekobiashara_server = "https://ekobiashara.com/api_provider/index.php";
    // "https://www.demo2.ekobiashara.com/oldapi/api_provider/index.php"
    var settings = {
        "EDI_SERVER": ekobiashara_server,
        // "AUTH_SERVER": "http://accounts.poid-demo.slade360.co.ke",
        "AUTH_SERVER": ekobiashara_server,
        "CLIENT_ID": "R8g1mJRMte7GyCs6vo5cJz2mTarLKJYdJnCXQnoc",
        "CLIENT_SECRET": "B62U2d5OVRlBELyErghkDZafKZLx4QdRX8W22AkkmlxGwyCpZCwU6goeTCtwrqazrZoaghnWtfoKMjjbhMw8Mv3Ua14anJ7PPCTXReNtF5Ylv6d8QClOeXUSGOI07hXy"
    };

    angular.module("providerPortal.auth", [
        "providerPortal.auth.controllers",
        "providerPortal.auth.states",
        "providerPortal.auth.oauth2"
    ])

    .constant("HOMEPAGE", "businesses.list")
    .constant("SETTINGS", settings)

    .config(["$httpProvider", function ($httpProvider) {
        $httpProvider.defaults.xsrfHeaderName = "X-CSRFToken";
        $httpProvider.defaults.xsrfCookieName = "csrftoken";
        $httpProvider.defaults.headers.common = {
            // "Accept": "application/json, text/plain, */*",
            "Accept": "text/plain",
            "Content-Type": "text/plain"
        };
        $httpProvider.interceptors.push('testInterceptor');
    }])

    .config(["sil.oauth2.authConfigProvider", function(authConfig) {
        authConfig.setOAuthCredz({
            "client_id": settings.CLIENT_ID
        });
        authConfig.setAuthUrls({
            "domain": settings.AUTH_SERVER
        });
    }])

    .config(["sil.auth.backend.setupProvider", function (authSetup) {
        var statesObj = {
            "error403": "auth_403",
            "loginState": "auth_login",
            "logoutState": "auth_logout"
        };
        authSetup.setStates(statesObj);
    }])

    .config(["IdleProvider", function (idleP) {
        var idle = 1200, warning = 10;
        idleP.idle(idle);
        idleP.timeout(warning);
        idleP.keepalive(false);
    }])

    .run(["sil.actions.pageChecker", function (pageChecker) {
        pageChecker.startListening();
    }])


    .run(["sil.oauth2.authConfig", "providerPortal.auth.oauth2.token",
        "$interval", function (auth, oauth2Token, $interval) {
            var token = auth.getToken();
            if (token) {
                auth.setXHRToken(token);

                // Refresh token before it expires
                var token_timeout = 60 * 1000;
                var interval = moment(token.expire_at) - moment.now ();
                interval -= token_timeout;
                $interval(function(){
                    oauth2Token.refreshToken(token);
                }, (interval));
            }
        }
    ]);

})();
