(function(){
    angular.module(APPLICATION_MODULE).config(["$sessionProvider", "$mdThemingProvider", function($sessionProvider, $mdThemingProvider){
        var ekobiashara_server = location.hostname == "127.0.0.1" ? "https://127.0.0.1/oldapi/api_provider/index.php" : "https://127.0.0.1/oldapi/api_provider/index.php";
        $sessionProvider.configureSettings({
            serverURL : ekobiashara_server,
            tokenName : "token",
            tokenAuthParams : {get_session : 1},
            tokenAuthLogError : true,
            tokenAuthDeleteOnError : false,
            keepToken : true,
            redirectingTitle : "Eko Biashara | Redirecting...",
            defaultHomeTitle : "Eko Biashara | Manage your business",
            defaultHomeState : "home",
            defaultHomeStateParams : null,
            sessionState : "dashboard",
            sessionStateParams : null,
            loginState : "home",
            loginStateParams : null,
            lockState : "auth.lock",
            lockStateParams : null,
            protectSessionOnIdle : true,
            protectSessionOnIdleTimeout : (15 * 60 * 60 * 1000),
            routingProtection : true,
            blockNonProtectedStates : false
        });
        $sessionProvider.setSessionCheckKeys(["token", "names", "email", "avatar"]);
        $mdThemingProvider.definePalette("ekobiashara_theme", {
            "50" : "E0F2F1",
            "100" : "B2DFDB",
            "200" : "80CBC4",
            "300" : "4DB6AC",
            "400" : "26A69A",
            "500" : "009688",
            "600" : "00897B",
            "700" : "00796B",
            "800" : "00695C",
            "900" : "004D40",
            "A100" : "A7FFEB",
            "A200" : "64FFDA",
            "A400" : "1DE9B6",
            "A700" : "00BFA5",
            "contrastDefaultColor": "light",
            "contrastDarkColors": ["50", "100", "200", "300", "400", "A100"],
            "contrastLightColors": undefined
        });
        $mdThemingProvider.definePalette("eko_accent_teal", {
            "50" : "E0F2F1",
            "100" : "B2DFDB",
            "200" : "80CBC4",
            "300" : "4DB6AC",
            "400" : "26A69A",
            "500" : "009688",
            "600" : "00897B",
            "700" : "00796B",
            "800" : "00695C",
            "900" : "004D40",
            "A100" : "00BFA5",
            "A200" : "00BFA5",
            "A400" : "00BFA5",
            "A700" : "00BFA5",
            "contrastDefaultColor": "light",
            "contrastDarkColors": ["50", "100", "200", "300", "400", "A100"],
            "contrastLightColors": undefined
        });
        $mdThemingProvider.theme("default").primaryPalette("ekobiashara_theme");
        $mdThemingProvider.theme("eko_teal_accent").primaryPalette("ekobiashara_theme").accentPalette("eko_accent_teal");
    }]);
})();