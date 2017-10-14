(function(angular) {
	angular.module('app.services.callApi', [])
    .factory('testInterceptor', testInterceptor)
	.service('apiBackend',['$http', 'SETTINGS', function($http, SETTINGS) {
		var mySerialize = function formSerialization(object, prepend){
            var serial = "";
            var p = function(k, v){
                if ("undefined" !== typeof prepend && prepend !== null) k = prepend + "[" + k + "]";
                if ("object" === typeof v && v !== null) return serial.trim().length < 1 ? mySerialize(v, k) : "&" + mySerialize(v, k);
                v = v !== null ? encodeURIComponent(v) : "";
                v = "undefined" !== typeof k && k !== null ? v = k + "=" + v : v;
                return serial.trim().length < 1 ? v : "&" + v;
            };
            if ("number" === typeof object.length && object.length < 1){
                var key = prepend;
                prepend = undefined;
                serial += p(key, "");
            }
            else if ("object" === typeof object && object != null){
                for (var key in object) if (object.hasOwnProperty(key)) serial += p(key, object[key]);
            }
            else {
                serial += p(prepend, object);
            }
            return serial;
        };

		this.formData = function dataFxn(data) {
			for (var key in object) if (object.hasOwnProperty(key)) serial += this.p(key, object[key]);
		};

		this.postApi = function postFxn(data) {
			var request = mySerialize(data);
			//return $http.post(SETTINGS.EDI_SERVER, data)
            /* $http.defaults.headers.common = {
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
            };*/
			return $http({
				url: SETTINGS.EDI_SERVER,
                method: "POST",
                data: request,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                responseType : typeof responseType !== "string" ? "json" : responseType
			});
		};
	}])

    function testInterceptor() {
        return {
            request: function(config) {
            return config;
        },

        requestError: function(config) {
            return config;
        },

        response: function(res) {
            return res;
        },

        responseError: function(res) {
            return res;
        }
      }
    };
})(window.angular);