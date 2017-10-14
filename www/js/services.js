String.prototype.padLeft = function(padding, limit){
    var str = this.toString();
    while (str.length < limit) {
        str = padding + str;
    }
    return str;
};
String.prototype.padRight = function(padding, limit){
    var str = this.toString();
    while (str.length < limit) {
        str = str + padding;
    }
    return str;
};
String.prototype.toCamelCase = function(){
    return camelCase(this);
};
Date.prototype.format = function(str){
    var year_months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var week_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var nm = year_months[this.getMonth()];
    var nd = week_days[this.getDay()];
    str = str.replace(/yy(y)+/g, this.getFullYear());
    str = str.replace(/yy/g, String(this.getFullYear()).substr(2, 2));
    str = str.replace(/MM/g, String(this.getMonth() + 1).padLeft("0", 2));
    str = str.replace(/MMM/g, year_months[this.getMonth()].substr(0, 3));
    str = str.replace(/MMM(M)+/g, year_months[this.getMonth()]);
    str = str.replace(/dd/g, String(this.getDate()).padLeft("0", 2));
    str = str.replace(/HH/g, String(this.getHours()).padLeft("0", 2));
    str = str.replace(/hh/g, String(String(this.getHours() - 12).replace(/-/, "")).padLeft("0", 2));
    str = str.replace(/mm/g, String(this.getMinutes()).padLeft("0", 2));
    str = str.replace(/ss/g, String(this.getSeconds()).padLeft("0", 2));
    str = str.replace(/a/g, Number(String(this.getHours() - 12).replace(/-/, "")) >= 12 ? "am" : "pm");
    return str;
};
Number.prototype.addCommas = function(){ return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
function camelCase(str){ var words = str.toString().split(" "), buffer = ""; for (var i = 0; i < words.length; i++){ var word = words[i]; var nWord = word.length > 1 ? word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase() : word.toUpperCase(); buffer += buffer.length < 1 ? nWord : " " + nWord; } return buffer; }
function getType(obj){ if (typeof obj === "object"){ if (obj === null) return "null"; if (Object.prototype.toString.call(obj) === '[object Array]') return "array"; return "object"; } return typeof obj; }
function emptyString(obj){ return !("string" === typeof obj && obj.trim().length > 0); }
function isArray(obj){ return "object" === typeof obj && Object.prototype.toString.call(obj) === '[object Array]'; }
function objectHasKeys(obj){ if ("object" === typeof obj && obj != null && Object.prototype.toString.call(obj) !== "[object Array]"){ for (var key in obj) if (obj.hasOwnProperty(key)) return true; } return false; }
function isElement(obj){ return typeof HTMLElement === "object" ? obj instanceof HTMLElement : typeof obj === "object" && obj.nodeType === 1 && typeof obj.style === "object" && typeof obj.ownerDocument === "object"; }
function isNode(obj){ return typeof Node === "object" ? obj instanceof Node : obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"; }
function isURL(str) { var pattern = new RegExp('^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$','i'); return pattern.test(str); }
function calcTax(amount, rate, status){
    if ("number" !== typeof amount) amount = 0;
    if ("number" !== typeof rate) rate = 0;
    if ("number" !== typeof status || [1,2,3].indexOf(status) < 0) status = 1;
    var totals = 0;
    if (status === 2) totals = Number(rate * (amount / (100 + rate))).round2();
    if (status === 3) totals = Number((rate / 100) * amount).round2();
    return totals;
}
function toNumber(obj, default_number){
    default_number = isNaN(Number(default_number)) ? 0 : Number(default_number);
    return obj == null || isNaN(Number(obj)) ? default_number : Number(obj);
}
function rand(min, max){
    min = isNaN(Number(min)) ? 0 : Number(min);
    max = isNaN(Number(max)) ? 1000 : Number(max);
    return Math.floor(Math.random() * max) + min;
}
function objectUpdate(obj, newContent){
    if ("object" === typeof obj && "object" === typeof newContent && obj != null && newContent != null){
        if (isArray(newContent) && isArray(obj)){
            if (obj.length > newContent.length) obj.splice(newContent.length);
            for (var i = 0; i < newContent.length; i++){
                if (obj.length > i){
                    if (!fullMatch(obj[i], newContent[i])){
                        if ("object" === typeof obj[i] && "object" === typeof newContent[i]){
                            objectUpdate(obj[i], newContent[i]);
                        }
                        else obj[i] = newContent[i];
                    }
                }
                else obj.push(newContent[i]);
            }
        }
        else {
            for (var _key in obj) if (obj.hasOwnProperty(_key)) if (!newContent.hasOwnProperty(_key)) delete obj[_key];
            for (var key in newContent){
                if (newContent.hasOwnProperty(key)){
                    if (obj.hasOwnProperty(key)){
                        if (!fullMatch(obj[key], newContent[key])){
                            if ("object" === typeof newContent[key] && "object" === typeof obj[key]){
                                objectUpdate(obj[key], newContent[key]);
                            }
                            else obj[key] = newContent[key];
                        }
                    }
                    else obj[key] = newContent[key];
                }
            }
        }
        return true;
    }
    return false;
}
function fullMatch(subject, object){
    if (typeof subject === typeof object){
        if ("object" === typeof subject && subject != null && object != null){
            var subjectKeys = [], objectKeys = [];
            for (var sKey in subject) if (subject.hasOwnProperty(sKey)) subjectKeys.push(sKey);
            for (var oKey in object) if (object.hasOwnProperty(oKey)) objectKeys.push(oKey);
            if (subjectKeys.length === objectKeys.length){
                if (subjectKeys.length > 0){
                    var keysMatch = true;
                    for (var i = 0; i < subjectKeys.length; i ++){
                        var key = subjectKeys[i];
                        if (object.hasOwnProperty(key)) keysMatch = fullMatch(subject[key], object[key]);
                        else keysMatch = false;
                        if (!keysMatch) break;
                    }
                    return keysMatch;
                }
                else return true;
            }
            else return false;
        }
        else return subject === object;
    }
    else return false;
}
function freeObj(obj){
    return JSON.parse(JSON.stringify(obj));
}
function toDataUrl(src, callback, outputFormat){
    outputFormat = outputFormat || 'image/png';
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback(dataURL);
    };
    img.src = src;
    if (img.complete || "undefined" === typeof img.complete){
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        img.src = src;
    }
}
function PrintElement(title, elem, autoprint){
    var width = title.trim().toLowerCase() == "etr" ? 300 : 700;
    var height = title.trim().toLowerCase() == "etr" ? 800 : 500;
    var stylePopup = "resizable=yes, scrollbars=yes, titlebar=yes, width=" + width + ", height=" + height + ", top=10, left=10";
    var mywindow = window.open("", "_blank", stylePopup);
    if ("object" === typeof mywindow && mywindow != null){
        mywindow.document.write('<html moznomarginboxes mozdisallowselectionprint><head><title>' + title  + '</title>');
        mywindow.document.write('<style type="text/css">@media print { @page { margin: 0; } body { margin: 1.6cm; }}</style>');
        mywindow.document.write('</head><body >');
        mywindow.document.write(elem.outerHTML);
        mywindow.document.write('</body></html>');
        mywindow.document.close();
        mywindow.focus();
        if (autoprint){
            mywindow.print();
            mywindow.close();
        }
        return true;
    }
    console.error("Browser might have disabled popups", mywindow, window);
    return false;
}
function text2barcodeImage(text, options){
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, options);
    return canvas.toDataURL("image/png");
}
function makeElement(obj){
    var elem = null;
    var not_attributes = ["type", "children"];
    if (objectHasKeys(obj) && obj.hasOwnProperty("type")){
        elem = document.createElement(obj["type"]);
        for (var key in obj){
            if (obj.hasOwnProperty(key)){
                if (not_attributes.indexOf(key) > -1){
                    if (key == "children"){
                        var children_array = obj["children"];
                        if (isArray(children_array)){
                            for (var i = 0; i < children_array.length; i ++){
                                var child = children_array[i];
                                if (objectHasKeys(child)){
                                    var child_element = makeElement(child);
                                    if (child_element != null) elem.appendChild(child_element);
                                }
                            }
                        }
                    }
                }
                else {
                    if (key == "innerHTML" || key == "style") elem[key] = obj[key];
                    else elem.setAttribute(key, obj[key]);
                }
            }
        }
    }
    return elem;
};
angular.module('starter.services', ["ngMaterial", "ui.router", "ngSanitize"]);
angular.module('starter.services', [])

    .provider("$session", function () {
        var settings = {
            serverURL: null,
            tokenName: "token",
            tokenAuthParams: null,
            tokenAuthLogError: true,
            tokenAuthDeleteOnError: false,
            keepToken: false,
            redirectingTitle: null,
            defaultHomeTitle: null,
            defaultHomeState: null,
            defaultHomeStateParams: null,
            sessionState: null,
            sessionStateParams: null,
            loginState: null,
            loginStateParams: null,
            lockState: null,
            lockStateParams: null,
            protectSessionOnIdle: false,
            protectSessionOnIdleTimeout: (30 * 60 * 60 * 1000),
            routingProtection: true,
            blockNonProtectedStates: false
        };
        var protectedStates = [];
        var sessionCheckKeys = [];
        this.addProtectedState = function (stateName) {
            if (!emptyString(stateName) && sessionCheckKeys.indexOf(stateName) < 0) {
                protectedStates.push(stateName);
            }
        };
        this.configureSettings = function (newSettings) {
            if (objectHasKeys(newSettings)) {
                for (var key in newSettings) {
                    if (newSettings.hasOwnProperty(key) && settings.hasOwnProperty(key)) {
                        settings[key] = newSettings[key];
                    }
                }
            }
        };
        this.setSessionCheckKeys = function (sessionKeysArray) {
            if (isArray(sessionKeysArray)) sessionCheckKeys = sessionKeysArray;
        };
        this.$get = function () {
            return {
                protectedStates: protectedStates,
                sessionKeys: sessionCheckKeys,
                settings: settings
            }
        };
    })
   
    .factory("$appAPI", ["$http", "$session", "$rootScope", function ($http, $session, $rootScope) {
        return {
            cookiesEnabled: function checkCookie() {
                var cookieEnabled = navigator.cookieEnabled;
                if (!cookieEnabled) {
                    document.cookie = "t";
                    cookieEnabled = document.cookie.indexOf("t") != -1;
                }
                return cookieEnabled;
            },
            localStorageEnabled: function () {
                try {
                    localStorage.setItem("t", "t");
                    localStorage.removeItem("t");
                    return true;
                } catch (e) {
                    return false;
                }
            },
            sessionStorageEnabled: function () {
                try {
                    sessionStorage.setItem("t", "t");
                    sessionStorage.removeItem("t");
                    return true;
                } catch (e) {
                    return false;
                }
            },
            saveLocal: function (key, string, session) {
                if ("boolean" === typeof session && session) {
                    if (this.cookiesEnabled()) {
                        this.setCookie(key, string);
                        return true;
                    }
                    else if (this.sessionStorageEnabled()) {
                        sessionStorage.setItem(key, string);
                        return true;
                    }
                    else return false;
                }
                else {
                    if (this.cookiesEnabled()) {
                        this.setCookie(key, string, 30);
                        return true;
                    }
                    else if (this.localStorageEnabled()) {
                        localStorage.setItem(key, string);
                        return true;
                    }
                    else return false;
                }
            },
            getLocal: function (key) {
                if (this.cookiesEnabled()) {
                    return this.getCookie(key);
                }
                else if (this.localStorageEnabled()) {
                    return localStorage.getItem(key);
                }
                return "";
            },
            nukeLocal: function (key) {
                if (this.localStorageEnabled()) localStorage.removeItem(key);
                if (this.sessionStorageEnabled()) sessionStorage.removeItem(key);
                if (this.cookiesEnabled()) this.removeCookie(key);
            },
            getCookie: function (cookie_name) {
                var cookies_str = document.cookie;
                var cookies = cookies_str.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    var cookie_details = cookies[i].split("=");
                    if (cookie_details.length == 2) {
                        var cookie_key = cookie_details[0].trim();
                        var cookie_value = cookie_details[1].trim();
                        if (cookie_key === cookie_name + "") {
                            return cookie_value;
                        }
                    }
                }
                return "";
            },
            removeCookie: function (name) {
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
            },
            setCookie: function (name, value, days) {
                var date, expires;
                if (days) {
                    date = new Date();
                    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date.toGMTString();
                }
                else {
                    expires = "";
                }
                document.cookie = name + "=" + value + expires + "; path=/";
            },
            removeToken: function () {
                if (!emptyString($session.settings.tokenName)) this.nukeLocal($session.settings.tokenName);
            },
            saveToken: function (value) {
                if (!emptyString($session.settings.tokenName)) {
                    return this.saveLocal($session.settings.tokenName, value, !$session.settings.keepToken);
                }
                return false;
            },
            getToken: function () {
                if (!emptyString($session.settings.tokenName)) {
                    return this.getLocal($session.settings.tokenName);
                }
                return "";
            },
            sendRequest: function (object, callback, responseType) {
                var server = !emptyString($session.settings.serverURL) ? $session.settings.serverURL : "";
                var isValidServer = function (str) {
                    var pattern = new RegExp('^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$', 'i');
                    return pattern.test(str);
                };
                var mySerialize = function (object, prepend) {
                    var serial = "";
                    var p = function (k, v) {
                        if ("undefined" !== typeof prepend && prepend !== null) k = prepend + "[" + k + "]";
                        if ("object" === typeof v && v !== null) return serial.trim().length < 1 ? mySerialize(v, k) : "&" + mySerialize(v, k);
                        v = v !== null ? encodeURIComponent(v) : "";
                        v = "undefined" !== typeof k && k !== null ? v = k + "=" + v : v;
                        return serial.trim().length < 1 ? v : "&" + v;
                    };
                    if ("number" === typeof object.length && object.length < 1) {
                        var key = prepend;
                        prepend = undefined;
                        serial += p(key, "");
                    }
                    else if ("object" === typeof object && object != null) {
                        for (var key in object) if (object.hasOwnProperty(key)) serial += p(key, object[key]);
                    }
                    else {
                        serial += p(prepend, object);
                    }
                    return serial;
                };
                if ("string" != typeof server || !isValidServer(server)) {
                    var response = "Invalid server address";
                    if ("object" === typeof callback && callback.hasOwnProperty("error") && "function" === typeof callback.error) callback.error(response);
                }
                else {
                    var params = mySerialize(object);
                    $http({
                        url: server,
                        method: "POST",
                        data: params,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        responseType: typeof responseType !== "string" ? "json" : responseType
                    }).then(
                        function (response) {
                            $rootScope.$broadcast("server-request-success", {
                                request: object,
                                params: params,
                                server: server,
                                response: response
                            });
                            if ("object" === typeof callback && callback.hasOwnProperty("success") && "function" === typeof callback.success) callback.success(response);
                        },
                        function (response) {
                            $rootScope.$broadcast("server-request-fail", {
                                request: object,
                                params: params,
                                server: server,
                                response: response
                            });
                            if ("object" === typeof callback && callback.hasOwnProperty("error") && "function" === typeof callback.error) callback.error(response);
                        }
                        );
                }
            },
            query: function (params_object, callback) {
                this.sendRequest(params_object, {
                    success: function (response) {
                        var data = response.data;
                        if ("object" === typeof data && data !== null && data.hasOwnProperty("response") && data.hasOwnProperty("data")) {
                            var param = data.data, type = data.response;
                            if (type == "success" && "object" === typeof callback && callback !== null && callback.hasOwnProperty("success") && "function" === typeof callback.success) callback.success(param, response);
                            else if (type == "error" && "object" === typeof callback && callback !== null && callback.hasOwnProperty("error") && "function" === typeof callback.error) callback.error(param, response);
                        }
                        else if ("object" === typeof callback && callback !== null && callback.hasOwnProperty("error") && "function" === typeof callback.error) callback.error(data, response);
                        if ("object" === typeof callback && callback !== null && callback.hasOwnProperty("then") && "function" === typeof callback.then) callback.then(data, response);
                    },
                    error: function (response) {
                        console.error("fatal request error", response);
                        var error = response.error, error_text = "Error processing request. Server unreachable or not working";
                        if ("object" === typeof callback && callback !== null && callback.hasOwnProperty("fail") && "function" === typeof callback.error) callback.fail(response);
                        else if ("object" === typeof callback && callback !== null && callback.hasOwnProperty("error") && "function" === typeof callback.error) callback.error(error_text, response);
                        if ("object" === typeof callback && callback !== null && callback.hasOwnProperty("then") && "function" === typeof callback.then) callback.then(error, response);
                    }
                });
            },
            tQuery: function (params_object, callback) {
                var token = this.getToken(); if ("object" === typeof params_object) params_object.token = token; this.query(params_object, callback);
            }
        }
    }])
    .service("$router", ["$state", function ($state) {
        this.go = function (state, params) {
            if ($state.href(state)) $state.go(state, params);
            else console.error("State not found:", state, params);
        };
    }])
    .service("$tokenAuth", ["$appAPI", "$q", "$session", function ($appAPI, $q, $session) {
        var isAuthenticating = false;
        return {
            isAuthenticating: function () {
                return isAuthenticating;
            },
            getToken: function () {
                return $appAPI.getToken();
            },
            getTokenSession: function (deleteTokenOnError, logErrorMessages) {
                deleteTokenOnError = "boolean" === typeof deleteTokenOnError && deleteTokenOnError;
                logErrorMessages = "boolean" === typeof logErrorMessages && logErrorMessages;
                if (objectHasKeys($session.settings.tokenAuthParams)) {
                    var deferred = $q.defer();
                    if (isAuthenticating) {
                        deferred.reject("Already self authenticating...");
                        return deferred.promise;
                    }
                    isAuthenticating = true;
                    $appAPI.tQuery($session.settings.tokenAuthParams, {
                        success: function (data) {
                            deferred.resolve(data);
                        },
                        error: function (error) {
                            if (!emptyString(error) && error.trim().toLowerCase() == "locked") {
                                deferred.resolve({ locked: true });
                            }
                            else {
                                if (deleteTokenOnError) $appAPI.removeToken();
                                if (logErrorMessages) console.error("Token authentication error: ", error);
                                deferred.reject(error);
                            }
                        },
                        then: function () {
                            isAuthenticating = false;
                        }
                    });
                    return deferred.promise;
                }
                return null;
            }
        };
    }])
    .service("$store", function ($rootScope, $appAPI, $q) {
        var localStore = {
            restored: false,
            autoSave: false,
            isReady: function () {
                return $appAPI.localStorageEnabled();
            },
            getSpace: function () {
                if (this.isReady()) {
                    return {
                        size: (1024 * 1024 * 5),
                        used: encodeURIComponent(JSON.stringify(localStorage)).length,
                        remaining: (this.size - this.used)
                    };
                }
                return { size: 0, used: 0, remaining: 0 };
            },
            hasSpace: function () {
                this.getSpace().remaining > 1024;
            },
            encryptKey: "4wZHlQjlDMHzlhSU3zHHbMP52zCg3hr0dI0uBJEw",
            encrypt: function (string, mode) {
                if ("boolean" === typeof mode && mode) {
                    return CryptoJS.AES.decrypt(string, this.encryptKey).toString(CryptoJS.enc.Utf8);
                }
                else return CryptoJS.AES.encrypt(string, this.encryptKey).toString();
            },
            storeString: function (key, string) {
                if (this.hasSpace() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0 && "string" === typeof string) {
                    localStorage.setItem(this.encrypt(key), this.encrypt(string));
                    return true;
                }
                return false;
            },
            storeNumber: function (key, number) {
                if (this.hasSpace() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0 && "number" === typeof number && !isNaN(number)) {
                    localStorage.setItem(this.encrypt(key), this.encrypt(number));
                    return true;
                }
                return false;
            },
            storeObject: function (key, object) {
                if (this.hasSpace() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0 && "object" === typeof object) {
                    localStorage.setItem(this.encrypt(key), this.encrypt(JSON.stringify(object)));
                    return true;
                }
                return false;
            },
            getString: function (key) {
                if (this.isReady() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0) {
                    return this.encrypt(localStorage.getItem(this.encrypt(key)), true);
                }
                return false;
            },
            getNumber: function (key) {
                if (this.isReady() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0) {
                    return Number(this.encrypt(localStorage.getItem(this.encrypt(key)), true));
                }
                return false;
            },
            getObject: function (key) {
                if (this.isReady() && ["string", "number"].indexOf(typeof key) > -1 && key.toString().length > 0) {
                    try {
                        return JSON.parse(this.encrypt(localStorage.getItem(this.encrypt(key)), true));
                    }
                    catch (e) {
                        return false;
                    }
                }
                return false;
            },
            saveRoot: function () {
                if ("object" === typeof $rootScope && $rootScope != null) {
                    for (var key in $rootScope) {
                        if ($rootScope.hasOwnProperty(key) && key.substring(0, 1) !== '$' && "function" !== typeof $rootScope[key]) {
                            var keyData = $rootScope[key];
                            if ("object" === typeof keyData) localStore.storeObject(key, keyData);
                            else if ("string" === typeof keyData) localStore.storeString(key, keyData);
                            else if ("number" === typeof keyData) localStore.storeNumber(key, keyData);
                        }
                    }
                }
            },
            restoreRoot: function () {
                if (this.isReady()) {
                    for (var i = 0; i < localStorage.length; i++) {
                        var key = this.encrypt(localStorage.key(i), true);
                        var keyValue = this.getObject(key);
                        if (keyValue === false) keyValue = this.getNumber(key);
                        if (isNaN(keyValue)) keyValue = this.getString(key);
                        $rootScope[key] = keyValue;
                        console.log("restored root items to local storage", $rootScope);
                    }
                    return true;
                }
                return false;
            },
            setAutosave: function (bool) {
                bool = "boolean" === typeof bool ? bool : true;
                if (bool == this.autoSave) return;
                else {
                    this.autoSave = bool;
                    if (this.autoSave) {
                        window.onbeforeunload = this.saveRoot;
                    }
                    else window.onbeforeunload = null;
                }
            }
        };
        var queryServer = function (queryId, secure, paramsObject, dataKey, rootKey, scopeObject, onSuccess, onError, onFail, showLoading, hideLoading, onBefore, onComplete) {
            var deferred = $q.defer();
            var wait = null;
            var before = null;
            var callback = {
                success: function (data) {
                    if (emptyString(dataKey)) $rootScope[rootKey] = data;
                    else $rootScope[rootKey] = data[dataKey];
                    if (objectHasKeys(scopeObject)) scopeObject = data[dataKey];
                    if ("function" === typeof onSuccess) onSuccess(data);
                    var promiseData = { id: queryId, type: "success", data: data };
                    $rootScope.$broadcast("query-server-success", promiseData);
                    deferred.resolve(promiseData);
                },
                error: function (error, xhr) {
                    if ("function" === typeof onError) onError(error);
                    var promiseData = { id: queryId, type: "error", data: error, xhr: xhr };
                    $rootScope.$broadcast("query-server-error", promiseData);
                    deferred.reject(promiseData);
                },
                fail: function (response) {
                    if ("function" === typeof onFail) onFail(response);
                    var promiseData = { id: queryId, type: "fail", response: response };
                    $rootScope.$broadcast("query-server-fail", promiseData);
                    deferred.reject(promiseData);
                },
                then: function () {
                    if ("function" === typeof hideLoading) hideLoading(wait);
                    if ("function" === typeof onComplete) onComplete(before);
                }
            };
            if (objectHasKeys(paramsObject) && !emptyString(rootKey)) {
                if ("function" === typeof onBefore) before = onBefore();
                if ("function" === typeof showLoading) wait = showLoading();
                if ("boolean" === typeof secure && secure) $appAPI.tQuery(paramsObject, callback);
                else $appAPI.query(paramsObject, callback);
            }
            else deferred.reject("Request failed. Check params or root key");
            return deferred.promise;
        };
        var bufferIds = [];
        var buffer = [];
        function addBuffer(details) {
            var newBuffer = {
                id: details.hasOwnProperty("id") ? details.id : bufferId(),
                done: false,
                isBuffering: false,
                secure: details.hasOwnProperty("secure") ? details.secure : false,
                paramsObject: details.hasOwnProperty("paramsObject") && objectHasKeys(details.paramsObject) ? details.paramsObject : {},
                dataKey: details.hasOwnProperty("dataKey") ? details.dataKey : undefined,
                rootKey: details.hasOwnProperty("rootKey") && !emptyString(details.rootKey) ? details.rootKey : "__dump",
                scopeObject: details.hasOwnProperty("scopeObject") ? details.scopeObject : undefined,
                onSuccess: details.hasOwnProperty("onSuccess") ? details.onSuccess : undefined,
                onError: details.hasOwnProperty("onError") ? details.onError : undefined,
                onFail: details.hasOwnProperty("onFail") ? details.onFail : undefined,
                showLoading: details.hasOwnProperty("showLoading") ? details.showLoading : undefined,
                hideLoading: details.hasOwnProperty("hideLoading") ? details.hideLoading : undefined,
                onBefore: details.hasOwnProperty("onBefore") ? details.onBefore : undefined,
                onComplete: details.hasOwnProperty("onComplete") ? details.onComplete : undefined
            };
            bufferIds.push(newBuffer.id);
            return buffer.push(newBuffer) - 1;
        }
        function processBuffer(ignoreError, logResponses, notifyResponses) {
            ignoreError = "boolean" === typeof ignoreError ? ignoreError : false;
            logResponses = "boolean" === typeof logResponses ? logResponses : false;
            notifyResponses = "boolean" === typeof notifyResponses ? notifyResponses : false;
            var bufferDefer = $q.defer();
            var cursor = 0;
            var complete = [];
            var fails = [];
            var continueProcessing = function () {
                if (buffer.length > cursor) {
                    var b = buffer[cursor];
                    if (!b.isBuffering && !b.done) {
                        b.isBuffering = true;
                        var promise = new queryServer(b.id, b.secure, b.paramsObject, b.dataKey, b.rootKey, b.scopeObject, b.onSuccess, b.onError, b.onFail, b.showLoading, b.hideLoading, b.onBefore, b.onComplete);
                        promise.then(
                            function (promise_data) {
                                b.done = true;
                                b.isBuffering = false;
                                var meta = { type: "success", buffer: b, pos: cursor, data: promise_data };
                                if (logResponses) console.info("buffer_success", meta);
                                if (notifyResponses) bufferDefer.notify(meta);
                                complete.push(meta);
                                cursor++;
                                continueProcessing();
                            },
                            function (promise_error) {
                                b.done = true;
                                b.isBuffering = false;
                                var meta = { type: "error", buffer: b, pos: cursor, data: promise_error };
                                fails.push(meta);
                                if (logResponses) console.error("buffer_error", meta);
                                if (notifyResponses) bufferDefer.notify(meta);
                                if (!ignoreError) bufferDefer.reject(fails);
                                else {
                                    cursor++;
                                    continueProcessing();
                                }
                            }
                        );
                    }
                }
                else {
                    for (var i = 0; i < buffer.length; i++) {
                        if (buffer[i].done) {
                            var bufferId = buffer[i].id;
                            var bufferIdPos = bufferIds.indexOf(bufferId);
                            if (bufferIdPos > -1) bufferIds.splice(bufferId, 1);
                            buffer.splice(i, 1);
                        }
                    }
                    if (buffer.length > 0) {
                        cursor = 0;
                        continueProcessing();
                    }
                    else bufferDefer.resolve({
                        complete: complete,
                        fails: fails,
                        count: (cursor - 1)
                    });
                }
            };
            continueProcessing();
            return bufferDefer.promise;
        }
        function hasProperties(object, propertiesArray) {
            if ("object" === typeof object && object != null && "object" === typeof propertiesArray && Object.prototype.toString.call(propertiesArray) === "[object Array]" && propertiesArray.length > 0) {
                var hasAllKeys = true;
                for (var i = 0; i < propertiesArray.length; i++) {
                    if (!object.hasOwnProperty(propertiesArray[i])) {
                        hasAllKeys = false;
                        break;
                    }
                }
                return hasAllKeys;
            }
            return false;
        }
        function testMatch(subject, object) {
            if (typeof subject === typeof object) {
                if ("object" === typeof subject && subject != null && object != null) {
                    var subjectKeys = [], objectKeys = [];
                    for (var sKey in subject) if (subject.hasOwnProperty(sKey)) subjectKeys.push(sKey);
                    for (var oKey in object) if (object.hasOwnProperty(oKey)) objectKeys.push(oKey);
                    if (subjectKeys.length === objectKeys.length) {
                        if (subjectKeys.length > 0) {
                            var keysMatch = true;
                            for (var i = 0; i < subjectKeys.length; i++) {
                                var key = subjectKeys[i];
                                if (object.hasOwnProperty(key)) keysMatch = testMatch(subject[key], object[key]);
                                else keysMatch = false;
                                if (!keysMatch) break;
                            }
                            return keysMatch;
                        }
                        else return true;
                    }
                    else return false;
                }
                else return subject === object;
            }
            else return false;
        }
        function bufferId() {
            var _rand = function (min, max) {
                min = isNaN(Number(min)) ? 0 : Number(min);
                max = isNaN(Number(max)) ? 1000 : Number(max);
                return Math.floor(Math.random() * max) + min;
            };
            var _generate = function () {
                return "" + _rand(1000, 9999) + _rand(1000, 9999) + _rand(1000, 9999) + _rand(1000, 9999) + _rand(1000, 9999) + _rand(1000, 9999);
            };
            var id = _generate();
            while (bufferIds.indexOf(id) > -1) id = _generate();
            return id;
        }
        function _isArray(arr) {
            return "object" === typeof arr && arr != null && Object.prototype.toString.call(arr) === "[object Array]";
        }
        return {
            init: function (setAutoSave) {
                if (!localStore.restored) {
                    localStore.restored = localStore.restoreRoot();
                    localStore.setAutosave("boolean" === typeof setAutoSave && setAutoSave);
                }
            },
            autoSave: function () {
                localStore.saveRoot();
            },
            addBuffer: function (bufferObject) {
                return addBuffer(bufferObject);
            },
            removeBuffer: function (pos) {
                if (!isNaN(pos) && buffer.length > pos) {
                    var remove = function () {
                        buffer.splice(pos, 1);
                    };
                    if (buffer[pos].isBuffering && !buffer[pos].done) {
                        var listenBufferDone = setInterval(function () {
                            if (buffer[pos].done) {
                                clearInterval(listenBufferDone);
                                remove();
                            }
                        }, 100);
                    }
                    else remove();
                }
            },
            processBuffers: function (ignoreErrors, logResponses, notifyResponses) {
                return processBuffer(ignoreErrors, logResponses, notifyResponses);
            },
            setScopeDataKeys: function (scope, keysArray) {
                if (_isArray(keysArray) && objectHasKeys(scope)) {
                    for (var i = 0; i < keysArray.length; i++) {
                        var key = keysArray[i];
                        var value = null;
                        if (!emptyString(key)) {
                            if ($rootScope.hasOwnProperty(key)) value = $rootScope[key];
                            else $rootScope[key] = value;
                        }
                        if (scope.hasOwnProperty(key)) {
                            if (!testMatch(scope[key], value)) {
                                if (_isArray(scope[key]) && _isArray(value)) {
                                    for (var i = 0; i < value.length; i++) {
                                        if (!testMatch(scope[key][i], value[i])) {
                                            scope[key][i] = value[i];
                                        }
                                    }
                                }
                                else scope[key] = value;
                            }
                        }
                        else scope[key] = value;
                    }
                    return true;
                }
                return false;
            },
            setKey: function (scope, scopeKey, dataKey, fetchParams, isSecure, onError, onSuccess, onBefore, onComplete) {
                scopeKey = scopeKey.trim().toLowerCase();
                if (objectHasKeys(scope) && !emptyString(scopeKey)) {
                    var keyUpdate = null;
                    if (objectHasKeys(fetchParams) && !emptyString(dataKey)) {
                        var before = null;
                        var callback = {
                            success: function (data) {
                                var responseValue = data;
                                if (!emptyString(dataKey)) {
                                    if (data.hasOwnProperty(dataKey)) {
                                        responseValue = data[dataKey];
                                        scope[scopeKey] = responseValue;
                                        $rootScope[scopeKey] = responseValue;
                                    }
                                    else console.error("Missing data key (" + dataKey + ") on response data:", data);
                                    if ("function" === typeof onSuccess) onSuccess(data);
                                }
                                else {
                                    scope[scopeKey] = responseValue;
                                    $rootScope[scopeKey] = responseValue;
                                }
                            },
                            error: function (error) {
                                if ("function" === typeof onError) onError(error);
                            },
                            then: function () {
                                if ("function" === typeof onComplete) onComplete(before);
                            }
                        };
                        var query = isSecure ? $appAPI.tQuery : $appAPI.query;
                        keyUpdate = function () {
                            if ("function" === typeof onBefore) before = onBefore();
                            query(fetchParams, callback);
                        };
                    }
                    if (!scope.hasOwnProperty(scopeKey)) scope[scopeKey] = {};
                    if ($rootScope.hasOwnProperty(scopeKey)) scope[scopeKey] = $rootScope[scopeKey];
                    else $rootScope[scopeKey] = scope[scopeKey];
                    scope[scopeKey + "Update"] = keyUpdate;
                    $rootScope[scopeKey + "Update"] = keyUpdate;
                    return true;
                }
                return false;
            },
            setPaginatedKey: function (scope, scopeKey, dataKey, dataPagesKey, fetchParams, isSecure, onError, onSuccess, onBefore, onComplete) {
                scopeKey = scopeKey.trim().toLowerCase();
                if (objectHasKeys(scope) && !emptyString(scopeKey)) {
                    var keyUpdate = null, nextPage = null, prevPage = null, changeLimit = null;
                    if (objectHasKeys(fetchParams) && !emptyString(dataKey) && !emptyString(dataPagesKey)) {
                        var before = null, page = 1, limit = 100;
                        var callback = {
                            success: function (data) {
                                if (data.hasOwnProperty(dataKey) && data.hasOwnProperty(dataPagesKey)) {
                                    scope[scopeKey + "Pages"] = Number(data[dataPagesKey]);
                                    scope[scopeKey + "Result"] = data[dataKey];
                                    scope[scopeKey + "Page"] = page;
                                    scope[scopeKey + "Limit"] = limit;
                                    $rootScope[scopeKey + "Pages"] = Number(data[dataPagesKey]);
                                    $rootScope[scopeKey + "Result"] = data[dataKey];
                                    $rootScope[scopeKey + "Page"] = page;
                                    $rootScope[scopeKey + "Limit"] = limit;
                                }
                                else console.error("Missing data key (" + dataKey + ") or missing data pages key (" + dataPagesKey + ") on data:", data);
                                if ("function" === typeof onSuccess) onSuccess(data);
                            },
                            error: function (error) {
                                if ("function" === typeof onError) onError(error);
                            },
                            then: function () {
                                if ("function" === typeof onComplete) onComplete(before);
                            }
                        };
                        var query = isSecure ? $appAPI.tQuery : $appAPI.query;
                        keyUpdate = function (page, limit) {
                            var newFetchParams = fetchParams;
                            page = toNumber(page, 1);
                            limit = toNumber(limit, 100);
                            newFetchParams.page = page - 1;
                            newFetchParams.limit = limit;
                            if ("function" === typeof onBefore) before = onBefore();
                            query(newFetchParams, callback);
                        };
                        nextPage = function () {
                            var page = 1;
                            var pages = 1;
                            var limit = 100;
                            var pageKey = scopeKey + "Page";
                            var pagesKey = scopeKey + "Pages";
                            var limitKey = scopeKey + "Limit";
                            var updateKey = scopeKey + "Update";
                            if (scope.hasOwnProperty(pagesKey)) pages = scope[pagesKey];
                            else if ($rootScope.hasOwnProperty(pagesKey)) pages = $rootScope[pagesKey];
                            if (scope.hasOwnProperty(pageKey)) page = scope[pageKey];
                            else if ($rootScope.hasOwnProperty(pageKey)) page = $rootScope[pageKey];
                            if (scope.hasOwnProperty(limitKey)) limit = scope[limitKey];
                            else if ($rootScope.hasOwnProperty(limitKey)) limit = $rootScope[limitKey];
                            if (!scope.hasOwnProperty(updateKey)) if ($rootScope.hasOwnProperty(updateKey)) scope[updateKey] = $rootScope[updateKey];
                            page = toNumber(page, 1);
                            pages = toNumber(pages, 1);
                            limit = toNumber(limit, 100);
                            var nextPage = page + 1;
                            if (nextPage > pages) nextPage = pages;
                            if (scope.hasOwnProperty(updateKey) && "function" === typeof scope[updateKey]) scope[updateKey](nextPage, limit);
                        };
                        prevPage = function () {
                            var page = 1;
                            var limit = 100;
                            var pageKey = scopeKey + "Page";
                            var limitKey = scopeKey + "Limit";
                            var updateKey = scopeKey + "Update";
                            if (scope.hasOwnProperty(pageKey)) page = scope[pageKey];
                            else if ($rootScope.hasOwnProperty(pageKey)) page = $rootScope[pageKey];
                            if (scope.hasOwnProperty(limitKey)) limit = scope[limitKey];
                            else if ($rootScope.hasOwnProperty(limitKey)) limit = $rootScope[limitKey];
                            if (!scope.hasOwnProperty(updateKey)) if ($rootScope.hasOwnProperty(updateKey)) scope[updateKey] = $rootScope[updateKey];
                            page = toNumber(page, 1);
                            limit = toNumber(limit, 100);
                            var prevPage = page - 1;
                            if (prevPage < 1) prevPage = 1;
                            if (scope.hasOwnProperty(updateKey) && "function" === typeof scope[updateKey]) scope[updateKey](prevPage, limit);
                        };
                        changeLimit = function (newLimit) {
                            var page = 1;
                            var limit = 100;
                            var pageKey = scopeKey + "Page";
                            var limitKey = scopeKey + "Limit";
                            var updateKey = scopeKey + "Update";
                            if (scope.hasOwnProperty(pageKey)) page = scope[pageKey];
                            else if ($rootScope.hasOwnProperty(pageKey)) page = $rootScope[pageKey];
                            if (scope.hasOwnProperty(limitKey)) limit = scope[limitKey];
                            else if ($rootScope.hasOwnProperty(limitKey)) limit = $rootScope[limitKey];
                            if (!scope.hasOwnProperty(updateKey)) if ($rootScope.hasOwnProperty(updateKey)) scope[updateKey] = $rootScope[updateKey];
                            page = toNumber(page, 1);
                            limit = toNumber(limit, 100);
                            newLimit = toNumber(newLimit, limit);
                            if (scope.hasOwnProperty(updateKey) && "function" === typeof scope[updateKey]) scope[updateKey](page, newLimit);
                        };
                    }
                    if (!scope.hasOwnProperty(scopeKey)) scope[scopeKey] = {};
                    if ($rootScope.hasOwnProperty(scopeKey)) scope[scopeKey] = $rootScope[scopeKey];
                    else $rootScope[scopeKey] = scope[scopeKey];
                    scope[scopeKey + "Update"] = keyUpdate;
                    $rootScope[scopeKey + "Update"] = keyUpdate;
                    scope[scopeKey + "Next"] = nextPage;
                    $rootScope[scopeKey + "Next"] = nextPage;
                    scope[scopeKey + "Prev"] = prevPage;
                    $rootScope[scopeKey + "Prev"] = prevPage;
                    scope[scopeKey + "ChangeLimit"] = changeLimit;
                    $rootScope[scopeKey + "ChangeLimit"] = changeLimit;
                    return true;
                }
                return false;
            },
            removeKey: function (scope, scopeKey) {
                if (objectHasKeys(scope) && !emptyString(scopeKey)) {
                    scopeKey = scopeKey.trim().toLowerCase();
                    var keysAppend = ["", "Page", "Pages", "Limit", "Update", "ChangeLimit"];
                    for (var i = 0; o < keysAppend.length; i++) {
                        var key = scopeKey + keysAppend[i];
                        if (scope.hasOwnProperty(key)) delete scope[key];
                        if ($rootScope.hasOwnProperty(key)) delete $rootScope[key];
                    }
                }
            }
        };
    })
