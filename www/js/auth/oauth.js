(function () {
    "use strict";

    angular.module("providerPortal.auth.oauth2", [])

    .factory("providerPortal.auth.oauth2.token", Oauth2);

    Oauth2.$inject = [
        "$http", "SETTINGS"
    ];
    function Oauth2($http, settings) {

        // var token_url = "/oauth2/token/";
        var token_url = "";


        function tokenRequest(payload) {
            return $http({
                data: payload,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                url: settings.AUTH_SERVER + token_url
            });
        }

        function refreshToken(token) {
            var payload =
                "grant_type=" + "refresh_token" +
                "&refresh_token=" + token.refresh_token +
                "&client_id=" + settings.CLIENT_ID +
                "&client_secret=" + settings.CLIENT_SECRET;

            return tokenRequest(payload);
        }

        function fetchToken(username, password) {
            /* var payload =
                "grant_type=" + "password" +
                "&login_email_session=" + username +
                "&password=" + password +
                "&client_id=" + settings.CLIENT_ID +
                "&client_secret=" + settings.CLIENT_SECRET;*/
            var payload =
                "login_email_session=" + username +
                "&password=" + password;

            return tokenRequest(payload);
        }

        return {
            "fetchToken": fetchToken,
            "refreshToken": refreshToken
        };
    }
})();
