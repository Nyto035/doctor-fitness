/**
 * sil-datalayer
 * @version v0.0.1-alpha.4 - 2016-07-25
 * @author SIL <developers@savannahinformatics.com> (http://savannahinformatics.com)
 * @license UNLICENSED
 */
(function(window, document, undefined) {
'use strict';
// Source: module.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.datalayer
     * @module sil.datalayer
     *
     * @requires sil.datalayer.datalayer
     * @requires sil.datalayer.store
     * @requires sil.datalayer.utils
     * @requires sil.datalayer.rest
     * @requires sil.datalayer.localstorage
     * @requires sil.datalayer.websocket
     *
     * @description
     * A module to combine other modules defined in `sil.datalayer.*`
     *
     * Overview of the datalayer
     * -------------------------
     *
     *```
     *          +------------------------------------------------------+
     *          |                     DATALAYER                        |
     *          |                                                      |
     *          |  +----------------+                                  |
     *          |  |   BACKENDS     |                                  |
     *          |  |                |                                  |
     *          |  | +-----------+  |            +------------------+  |
     *          |  | |           |  |  request   |                  |  |
     *          |  | |           |<--------------|    DATASTORE     |  |
     *          |  | |    XHR    |  |            |                  |  |
     *          |  | |           |-------------->|                  |  |
     *          |  | |           |  |  promise   |                  |  |
     *          |  | +-----------+  |            |   +-------+      |  |
     *          |  |                |            |   |       |      |  |
     *          |  | +-----------+  |            |   | CACHE |      |  |
     *          |  | |           |  |  request   |   |       |      |  |
     *          |  | |  BROWSER  |<--------------|   +-------+      |  |
     *          |  | |  STORAGE  |  |            |                  |  |
     *          |  | |           |-------------->|                  |  |
     *          |  | |           |  |  promise   |                  |  |
     *          |  | +-----------+  |            |                  |  |
     *          |  |                |            |                  |  |
     *          |  | +-----------+  |            |                  |  |
     *          |  | |           |  | register   |                  |  |
     *          |  | |   WEB     |<--------------|                  |  |
     *          |  | |  SOCKET   |  |            |                  |  |
     *          |  | |           |-------------->|                  |  |
     *          |  | |           |  | callback   |                  |  |
     *          |  | +-----------+  |            +------------------+  |
     *          |  |                |                                  |
     *          |  +----------------+                                  |
     *          |                                                      |
     *          +------------------------------------------------------+
     *```
     *
     * The datalayer is comprised of four main parts:
     * 1. Datalayer wrapper
     * 2. Store
     * 3. Cache
     * 4. Backend
     *
     *
     * 1. {@link sil.datalayer.datalayer:silDataLayer Datalayer wrapper}
     * ------------------------------------------------------------------
     * It is the API to the datalayer. It provides abstraction of the stores to
     * be used in datalayer transactions.
     *
     * 2. {@link sil.datalayer.store:silDataStoreFactory.DataStore Store}
     * -------------------------------------------------------------------
     * Provides a common interface to access data, via REST, browser storage or
     * push updates e.g. websockets
     *
     * 3. Cache
     * ---------
     * Provides an LRU cache from *read* transactions done by the backend. It's
     * main customer is the
     * {@link sil.datalayer.rest:silRESTBackend REST backend}. Every store has
     * a cache of its own.
     *
     * 4. Backend
     * -----------
     * Manages access to the actual data source whether remote server
     * (e.g. http/websocket) or browser storage
     * (e.g. localStorage/indexedDB/sessionStorage)
     *
     */
    angular.module("sil.datalayer", [
        "sil.datalayer.datalayer",
        "sil.datalayer.store",
        "sil.datalayer.utils",
        "sil.datalayer.rest",
        "sil.datalayer.websocket"
    ]);

})(window.angular);

// Source: cache.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.datalayer.cache
     * @module sil.datalayer
     *
     * @description
     * Implements the caching of responses from store backends.
     */
    angular.module("sil.datalayer.cache", [])
    .service("silDataCacheFactory", DataCacheFactory);

    /**
     * @ngdoc service
     * @name sil.datalayer.cache:silDataCacheFactory
     * @module sil.datalayer.cache
     * @requires $cacheFactory
     *
     * @description
     * A factory that gets a cache to be used by the datalayer
     *
     * https://docs.angularjs.org/api/ng/service/$http#caching
     * https://code.angularjs.org/1.5.0/docs/api/ng/service/$cacheFactory
     */
    DataCacheFactory.$inject = ["$cacheFactory"];
    function DataCacheFactory ($cacheFactory) {
        function factory (name) {
            var cache = $cacheFactory("sil.datalayer.cache:" + name);

            return cache;
        }
        return factory;
    }

})(window.angular);

// Source: datalayer.js
(function (angular) {

/**
     * @ngdoc overview
     * @name sil.datalayer.datalayer
     * @requires sil.datalayer.store
     *
     * @description
     * Implements a unified interface through which all data requests shall be
     * channelled through
     */
    angular.module("sil.datalayer.datalayer", [
        "sil.datalayer.store"
    ])
    .service("silDataLayer", DataLayer);

    /**
     * @ngdoc service
     * @name sil.datalayer.datalayer:silDataLayer
     * @module sil.datalayer.datalayer
     * @requires sil.datalayer.store:silDataStoreFactory
     */
    DataLayer.$inject = ["silDataStoreFactory"];
    function DataLayer (silDataStoreFactory) {
        this.silDataStoreFactory = silDataStoreFactory;
    }

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name getStore
     *
     * @param {String} name Name of the store
     *
     * @returns {Object}
     * {@link sil.datalayer.store:DataStoreFactory.DataStore DataStore}
     * that resolves into the created record.
     *
     * @throws {Error} If the store is not found
     *
     * @description
     * A helper method to retrieve a
     * {@link sil.datalayer.store:DataStoreFactory.DataStore store} from the
     * {@link sil.datalayer.store:DataStoreFactory registry}. It
     * throws an error if the store is not defined in the registry.
     */
    DataLayer.prototype.getStore = function (name) {
        var s = this.silDataStoreFactory.get(name);
        if (! s) {
            throw new Error("store '" + name + "' is not defined");
        }
        return s;
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name create
     *
     * @param {String} name Name of the store
     * @param {Object} data Record to be created
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves into the created record.
     *
     * @description
     * Creates a new record in the store.
     */
    DataLayer.prototype.create = function (name, data, options) {
        return this.getStore(name).create(data, options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name update
     *
     * @param {String} name Name of the store
     * @param {String} uid Unique identifier of the record to be updated
     * @param {Object} data Properties of the record to be updated
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves into the complete updated record.
     *
     * @description
     * Updates a single record in the store.
     *
     */
    DataLayer.prototype.update = function (name, uid, data, options) {
        return this.getStore(name).update(uid, data, options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name remove
     *
     * @param {String} name Name of the store
     * @param {String} uid Unique identifier of the record to be deleted
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves to nothing on successful deletion.
     *
     * @description
     * Removes a record from the store
     */
    DataLayer.prototype.remove = function (name, uid, options) {
        return this.getStore(name).remove(uid, options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name removeAll
     *
     * @param {String} name Name of the store
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves to nothing on successful deletion.
     *
     * @description
     * Removes all records from the store
     */
    DataLayer.prototype.removeAll = function (name, options) {
        return this.getStore(name).removeAll(options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name list
     *
     * @param {String} name Name of the store
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves into the fetched list of records.
     *
     * @description
     * Retrieves a list of records from the store.
     */
    DataLayer.prototype.list = function (name, options) {
        return this.getStore(name).list(options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.datalayer:silDataLayer
     * @name get
     *
     * @param {String} name Name of the store
     * @param {String} uid Unique identifier of the record to be fetched
     * @param {Object=} options Extra parameters to be passed to the data backend
     *
     * @returns {Promise} Promise that resolves into the record to be fetched.
     *
     * @description
     * Retrieves a single record from the store.
     */
    DataLayer.prototype.get = function (name, uid, options) {
        return this.getStore(name).get(uid, options);
    };

})(window.angular);

// Source: localstorage.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.datalayer.localstorage
     *
     * @description
     * Implements data persistence using the client browser's localStorage or
     * sessionStorage.
     * This supports simple key-value storage
     */
    angular.module("sil.datalayer.localstorage", [])

    /**
     * @ngdoc service
     * @name sil.datalayer.localstorage:silLocalStorageBackendProvider
     * @module sil.datalayer.localstorage
     *
     * @description
     * Configures silLocalStorageBackend settings
     */
    .provider("silLocalStorageBackend", LocalStorageBackendProvider);

    function LocalStorageBackendProvider() {
        var valid_backends = ["localStorage", "sessionStorage"];
        var backend = valid_backends[0];

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackendProvider
         * @name setBackend
         *
         * @param {String} backendname Name of the backend to use. Valid values
         * are `localStorage` or `sessionStorage`
         *
         * @returns {Object} The instance of the provider
         *
         * @throws {Error} If the backendname is not valid.
         *
         * @description
         * Sets the backend to use
         *
         */
        this.setBackend = function (backendname) {
            if (valid_backends.indexOf(backendname) === -1) {
                throw new Error(
                    "'" + backendname + "'" +
                    " is an invalid local storage backend." +
                    " Valid backends are: " + valid_backends.join(", ")
                );
            }
            backend = backendname;
            return this;
        };

        this.$get = ["$window", "$q", function ($window, $q) {
            return new LocalStorageBackend($window[backend], $q);
        }];
    }
    /**
     * @ngdoc service
     * @name sil.datalayer.localstorage:silLocalStorageBackend
     * @module sil.datalayer.localstorage
     * @requires $q
     *
     * @description
     * Gives access to localStorage or sessionStorage
     */
    function LocalStorageBackend(lStorage, $q) {

        /**
         * Wraps result in the envelope expected by clients
         */
        function wrapResult (result) {
            return {
                "data": result
            };
        }

        /**
         * Convert a string to JSON and return it, else return the original
         * string
         */
        function toJSON(i) {
            try {
                return JSON.parse(i);
            } catch (e) {
            }
            return i;
        }

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name create
         *
         * @param {Object} val Record object to create
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Creates a new record in the store.
         * Just because [safari is a douche and storage can get filled up]
         * (https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#Exceptions),
         * this promise can be rejected
         */
        LocalStorageBackend.prototype.create = function (data, options) {
            function resolver(resolve, reject) {
                // TODO reject undefined values
                var key = angular.isObject(options) ? options.key : data.id;
                if (!key) {
                    reject(wrapResult({"error":"provide key or id"}));
                }
                try {
                    lStorage.setItem(key, JSON.stringify(data));
                    resolve(wrapResult(data));
                } catch (e) {
                    reject(wrapResult(e));
                }
            }
            return $q(resolver);
        };

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name get
         *
         * @param {String} key Unique identifier of the record
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Retrieves a record by its uid
         *
         */
        LocalStorageBackend.prototype.get = function (key) {
            function resolver(resolve) {
                var result = lStorage.getItem(key);
                resolve(wrapResult(toJSON(result)));
            }
            return $q(resolver);
        };

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name list
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Retrieves a list of records from the store
         *
         */
        LocalStorageBackend.prototype.list = function () {
            function resolver(resolve) {
                var len = lStorage.length;
                var data = [];
                for (var i = 0; i < len; i++) {
                    data.push(
                        toJSON(lStorage.getItem(lStorage.key(i)))
                    );
                }
                resolve(wrapResult({results: data}));
            }
            return $q(resolver);
        };

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name update
         *
         * @param {String} key Unique identifier of the record
         * @param {Object} val Record object to update
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Updates or creates a new record in the store. Just like the
         * {@link sil.datalayer.localstorage.silLocalStorageBackend#create create}
         * method, this method can reject promises.
         *
         */
        LocalStorageBackend.prototype.update = function (key, val) {
            var data = angular.copy(val);
            val.id = key;
            return this.create(data);
        };

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name remove
         *
         * @param {String} key Unique identifier of the record
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Removes a record from the store, identified by its key
         *
         */
        LocalStorageBackend.prototype.remove = function (key) {
            function resolver (resolve) {
                lStorage.removeItem(key);
                resolve(wrapResult(undefined));
            }
            return $q(resolver);
        };

        /**
         * @ngdoc method
         * @methodOf sil.datalayer.localstorage:silLocalStorageBackend
         * @name removeAll
         *
         * @returns {Promise} A promise that will resolve succesfully if the
         * method succeeds
         *
         * @description
         * Removes all records from the store
         *
         */
        LocalStorageBackend.prototype.removeAll = function () {
            function resolver (resolve) {
                lStorage.clear();
                resolve(wrapResult(undefined));
            }
            return $q(resolver);
        };
    }
})(window.angular);

// Source: rest.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.datalayer.rest
     *
     * @description
     * Implements persistence of data to a server via REST
     *
     * Configures `$http` service with the following options:
     *   - `useApplyAsync = true`
     *
     *      to combine processing of multiple http
     *      responses received at around the same time
     *
     *   - `useLegacyPromiseExtensions = false`
     *
     *      to return promises without the
     *      deprecated shorthand methods success and error
     *
     * @requires sil.datalayer.utils
     *
     */
    angular.module("sil.datalayer.rest", [
        "sil.datalayer.utils"
    ])

    .config(["$httpProvider", function RESTBackendConfig($httpProvider) {
        $httpProvider.useApplyAsync = true;
        $httpProvider.useLegacyPromiseExtensions = false;
    }])

    .service("silRESTBackend", RESTBackend);

    /**
     * @ngdoc service
     * @name sil.datalayer.rest:silRESTBackend
     * @module sil.datalayer.rest
     *
     * @requires $http All requests shall use this
     * @requires $q To reject promise expected from `removeAll`
     * @requires sil.datalayer.utils:silDataLayerUtils To perform url joins
     *
     * @description
     * Implements persistence of data to a server via REST
     */
    RESTBackend.$inject = ["$http", "$q", "silDataLayerUtils"];
    function RESTBackend ($http, $q, silDataLayerUtils) {
        this.$http = $http;
        this.$q = $q;
        this.urlJoin = silDataLayerUtils.urlJoin;
    }

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name create
     *
     * @param {Object} data Data to send
     * @param {Object=} options Extra options
     *
     * @returns {HttpPromise} Promise that will be successful
     *
     * @description
     * Creates a record to the resource.
     *
     */
    RESTBackend.prototype.create = function(data, options) {
        return this.xhr("POST", data, options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name list
     *
     * @param {Object=} options Extra options
     *
     * @returns {HttpPromise} Promise
     *
     * @description
     * Retrieves multiple records from a resource.
     *
     */
    RESTBackend.prototype.list = function(options) {
        return this.xhr("GET", undefined, options);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name get
     *
     * @param {String} uid Unique identifier of the record
     * @param {Object=} options Extra options
     *
     * @returns {HttpPromise} Promise
     *
     * @description
     * Retrieves a record from a resource.
     *
     */
    RESTBackend.prototype.get = function(uid, options) {
        var opts = _.assign(
            {},
            options,
            {url: this.urlJoin(options.url, uid)}
        );
        return this.xhr("GET", undefined, opts);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name xhr
     *
     * @param {String=} method HTTP method
     * @param {Object=} data Data to send
     * @param {Object} options Extra options, which are all defined in
     * [$http](https://code.angularjs.org/1.5.0/docs/api/ng/service/$http)'s
     * config. An extra parameter, `toFile` is added to the extra options. It
     * tells the store to format the XHR response into a blob.
     *
     *
     * @returns {HttpPromise} Promise that will resolve successfully if the
     * xhr call is successful. If the `toFile` parameter in options
     * is specified, the promise will resolve into an object containing
     * the following properties:
     * - **blob** the data as a blob object
     * - **fname** the suggested filename, usually from the
     * `Content-Disposition` header
     *
     * @example
     * <example module="testApp">
     *   <file name="index.html" >
     *       <div ng-controller="testCtrl">
     *           <textarea ng-model="url" style="width:100%;"></textarea>
     *           <button ng-click="download(url)" ng-disabled="!url||promise">
     *               Get the File!!
     *           </button>
     *           <div class="alert alert-warning" ng-if="err">
     *               <p>{{err}}</p>
     *           </div>
     *       </div>
     *   </file>
     *   <file name="index.js">
     *        angular.module('testApp', ['sil.datalayer.rest'])
     *        .controller('testCtrl', ['$scope', 'silRESTBackend',
     *            function ($scope, silRESTBackend) {
     *               $scope.url = "http://localhost:8000/api/common/contacts/";
     *               $scope.promise = null;
     *               $scope.download = function (url) {
     *                  $scope.promise = silRESTBackend.list(
     *                      {
     *                          "cache":true,
     *                          "params": {
     *                              "access_token": "wQkYUaQlOozbpK6yWWmW6IrVKv7aAz",
     *                              "format": "excel"
     *                          },
     *                          "toFile": true,
     *                          "url": url
     *                      }
     *                  ).then(function onLoad(response) {
     *                      var filereader = new FileReader();
     *                      filereader.onload = function () {
     *                          var a = document.createElement("a");
     *                          a.href = filereader.result;
     *                          a.download = response.data.fname || "";
     *                          a.click();
     *                       };
     *                      filereader.readAsDataURL(response.data.blob);
     *                      $scope.promise = null;
     *                   }, function (err) {
     *                       $scope.err = err;
     *                       $scope.promise = null;
     *                   });
     *               };
     *            }
     *        ]);
     *   </file>
     * </example>
     */
    RESTBackend.prototype.xhr = function(method, data, options) {
        var other_args = {
            "data": data,
            "method": method,
        };
        _.assign(other_args, options);

        function transformFxn(data, headersGetter) {
            var mimetype = headersGetter("content-type");
            var content_disposition = headersGetter("content-disposition") || "";
            // this regex handles the following situations:
            //  - content-disposition: attachment; filename="file.txt"
            var fname = (/filename\="(.*)"/i.exec(content_disposition) || [])[1];
            var blob = new Blob([data], {type: mimetype});
            return {
                "blob": blob,
                "fname": fname
            };
        }

        if (angular.isDefined(other_args.toFile)) {
            // move `options.toFile` to datalayer or datastore
            other_args.responseType = "arraybuffer";
            other_args.transformResponse = transformFxn;
            delete other_args.toFile;
        }

        return this.$http(other_args);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name remove
     *
     * @param {String} uid Unique identifier of the record
     * @param {Object=} options Options
     *
     * @returns {HttpPromise} Promise that will be successful on deletion of
     * the record
     *
     * @description
     * Removes a record from the resource.
     *
     */
    RESTBackend.prototype.remove = function (uid, options) {
        var opts = _.assign(
            {},
            options,
            {url: this.urlJoin(options.url, uid)}
        );
        return this.xhr("DELETE", undefined, opts);
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name removeAll
     *
     * @returns {Promise} A rejected promise because the backend does not
     * support it
     *
     */
    RESTBackend.prototype.removeAll = function () {
        return this.$q.reject("`removeAll` is not supported");
    };

    /**
     * @ngdoc method
     * @methodOf sil.datalayer.rest:silRESTBackend
     * @name update
     *
     * @param {Object} data Data to send
     * @param {Object=} options Extra options
     *
     * @returns {HttpPromise} Promise that will resolve into an object containing
     * the updated record
     *
     * @description
     * Updates a record to the resource.
     *
     */
    RESTBackend.prototype.update = function(uid, data, options) {
        var opts = _.assign(
            {},
            options,
            {url: this.urlJoin(options.url, uid)}
        );
        return this.xhr("PATCH", data, opts);
    };

})(window.angular, window._);

// Source: store.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.datalayer.store
     * @requires sil.datalayer.rest
     *
     * @description
     * Provides abstraction of data persistence
     *
     */
    angular.module("sil.datalayer.store", [
        "sil.datalayer.rest",
        "sil.datalayer.cache",
        "sil.datalayer.websocket"
    ])

    .service("silDataStoreFactory", DataStoreFactoryService);

    /**
     * @ngdoc service
     * @module sil.datalayer.store
     * @name sil.datalayer.store:silDataStoreFactory
     * @requires sil.datalayer.rest:silRESTBackend Used as the default backend
     *
     * @param {String} name Name of the store
     * @param {Object=} options Options to be passed to the store
     *
     * @throws {Error} If creating a store with same name as an existing one
     *
     * @description
     * A factory and registry for data stores. Inspired by angular's
     * `$cacheFactory`
     *
     * ```javascript
     *  // create a new store
     *  silDataStoreFactory('storename');
     *
     *  // an error is thrown for creating a store with an existing name
     *  silDataStoreFactory('storename');
     *
     *  // get or create a store
     *  silDataStoreFactory.getOrCreate('storename');
     *
     *  // can be done multiple times
     *  silDataStoreFactory.getOrCreate('storename');
     * ```
     *
     * @returns {silDataStoreFactory.DataStore} A new datastore instance
     *
     */
    DataStoreFactoryService.$inject = [
        "silRESTBackend", "silWebSocketBackend", "silDataCacheFactory"
    ];
    function DataStoreFactoryService(silRESTBackend, silWebSocketBackend, silDataCacheFactory) {
        /**
         * Creates a new object without a prototype.
         * This object is useful for lookup without having to
         * guard against prototypically inherited properties
         * via hasOwnProperty.
         *
         * (stolen from angularjs#createMap)
         */
        var stores = Object.create(null);

        function DataStoreFactory(name, options) {
            if (name in stores) {
                throw new Error(
                    "the store '" + name + "' has already been defined"
                );
            }
            stores[name] = new DataStore(name, options);
            return stores[name];
        }

        /**
         * @ngdoc method
         * @module sil.datalayer.store
         * @name get
         * @methodOf sil.datalayer.store:silDataStoreFactory
         *
         * @returns {DataStore|undefined} A store or `undefined` if
         * a store by the name isn't defined
         *
         * @description
         * Gets an store
         */
        DataStoreFactory.get = function (name) {
            return stores[name];
        };

        /**
         * @ngdoc method
         * @module sil.datalayer.store
         * @name getOrCreate
         * @methodOf sil.datalayer.store:silDataStoreFactory
         *
         * @returns {DataStore}
         * An existing store or a freshly created one
         *
         * @description
         * Gets an store if it exists or creates a store if it does not exist
         */
        DataStoreFactory.getOrCreate = function (name, options) {
            if (name in stores) {
                return stores[name];
            }
            return DataStoreFactory(name, options);
        };

        /**
         * @ngdoc method
         * @module sil.datalayer.store
         * @name remove
         * @methodOf sil.datalayer.store:silDataStoreFactory
         *
         * @returns {boolean} `true` if it was deleted, `false` if
         * the store did not exist prior to deletion
         *
         * @description
         * Removes a store if it is defined
         */
        DataStoreFactory.remove = function (name) {
            if (name in stores) {
                return delete stores[name];
            }
            return false;
        };

        /**
         * @ngdoc object
         * @module sil.datalayer.store
         * @name sil.datalayer.store:silDataStoreFactory.DataStore
         *
         * @param {String} name Name of the store
         * @param {Object=} options Extra options that the store accepts.
         * The default `DataStore` takes the following options:
         * - **backend** The backend to use to *persist* data. If not provided,
         *   the {@link sil.datalayer.rest:silRESTBackend rest} backend is used
         * - **cache** Cache to use for the store.
         * - **updateBackend** The backend that will provide `push` updates.
         *   If not provided, the
         *   {@link sil.datalayer.websocket:silWebSocketBackend websocket} backend is
         *   used
         *
         * @description
         * Handles abstraction of retreiving data from the persistence layer
         */
        function DataStore (name, options) {
            var self = this;
            self.name = name;

            var opts = options || {};
            self.backend = opts.backend || silRESTBackend;
            self.updateBackend = opts.updateBackend || silWebSocketBackend;
            opts.cache = opts.cache === false ? opts.cache
                        : angular.isObject(opts.cache) ? opts.cache
                        : silDataCacheFactory(name);

            // freeze default options
            delete opts.backend;
            delete opts.updateBackend;
            Object.freeze(opts);

            var listeners = [];

            self.updateBackend.register(null, updateReceived);

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name getOptions
             *
             * @description - Get options that belong to a store
             *
             * @returns {Object} - An object containing the store's options.
             *
             */
            self.getOptions = function () {
                return opts;
            };

            /**
             * Updates the cache after a data update
             *
             * + for creations (uid, data, options):
             *     - add item to cache using uid
             * + for deletions (uid, null, options):
             *     - remove item from cache based on its uid
             * + for updates (uid, data, options):
             *     - search the cache for the item based on the uid
             *     - update cached value
             */
            self.updateCache = function () {
                if (opts.cache) {
                    opts.cache.removeAll();
                }
            };

            /**
             * Executes all listeners when an unsolicited update to the
             * store is received.
             *
             * After all listeners are executed, the datastore tries to
             * refresh the cache
             *
             * @param {any} update The update pushed to the store
             */
            function updateReceived(update) {
                angular.forEach(listeners, function (listener) {
                    // wrap this in $apply ???
                    listener(update);
                });
                // revalidate cache silently
                // for key in cache.keys()
                // if key is a list: backend.get(key)
                // if key is object and object in update: backend.get(key)
                // for now, clear the whole cache
                self.updateCache();
            }

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name create
             *
             * @param {Object} data Record to be created
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves into the created record.
             *
             * @description
             * Creates a new record in the backend.
             */
            self.create = function (data, options) {
                // data.id = data.id || this.generateUUID();
                var backend_opts = _.assign({}, opts, options);
                return self.backend.create(data, backend_opts).then(
                    function createAction(response) {
                        self.updateCache();
                        return response;
                    }
                );
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name get
             *
             * @param {String} uid Unique identifier of the record to be fetched
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves into the record to be fetched.
             *
             * @description
             * Retrieves a single record from the backend.
             */
            self.get = function (uid, options) {
                var backend_opts = _.assign({}, opts, options);
                return self.backend.get(uid, backend_opts);
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name list
             *
             * @param {String} name Name of the store
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves into the fetched list of records.
             *
             * @description
             * Retrieves a list of records from the backend.
             */
            self.list = function (options) {
                var backend_opts = _.assign({}, opts, options);
                return self.backend.list(backend_opts);
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name remove
             *
             * @param {String} uid Unique identifier of the record to be deleted
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves to nothing on successful deletion.
             *
             * @description
             * Removes a record from the backend
             */
            self.remove = function (uid, options) {
                var backend_opts = _.assign({}, opts, options);
                return self.backend.remove(uid, backend_opts).then(
                    function removeAction(response) {
                        self.updateCache();
                        return response;
                    }
                );
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name removeAll
             *
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves to nothing on successful deletion.
             *
             * @description
             * Removes all records from the backend
             */
            self.removeAll = function (options) {
                var backend_opts = _.assign({}, opts, options);
                return self.backend.removeAll(backend_opts).then(
                    function removeAction(response) {
                        self.updateCache();
                        return response;
                    }
                );
            };
            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name update
             *
             * @param {String} uid Unique identifier of the record to be updated
             * @param {Object} data Properties of the record to be updated
             * @param {Object=} options Extra parameters to be passed to the data backend
             *
             * @returns {Promise} Promise that resolves into the complete updated record.
             *
             * @description
             * Updates a single record in the backend.
             *
             */
            self.update = function (uid, data, options) {
                var backend_opts = _.assign({}, opts, options);
                return self.backend.update(uid, data, backend_opts).then(
                    function updateAction(d) {
                        self.updateCache(uid, d, options);
                        return d;
                    }
                );
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name register
             *
             * @param {function} fxn Listener to be called
             *
             * @returns {boolean} `true` if a new registration was done, `false` otherwise
             *
             * @description
             * Registers a listener to be executed when an update is received
             *
             */
            self.register = function(fxn) {
                if (_.contains(listeners, fxn)) {
                    return false;
                }
                listeners.push(fxn);
                return true;
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name deRegister
             *
             * @param {function} fxn Listener to be removed
             *
             * @returns {boolean} `true` de-registration succeeds, `false` otherwise
             *
             * @description
             * Removes a listener from list of listeners, if it was registered
             *
             */
            self.deRegister = function(fxn) {
                if (! _.contains(listeners, fxn)) {
                    return false;
                }
                listeners = _.without(listeners, fxn);
                return true;
            };

            /**
             * @ngdoc method
             * @methodOf sil.datalayer.store:silDataStoreFactory.DataStore
             * @name generateId
             *
             * @returns {String} UUID generated
             *
             * @description
             * Generates a UUID version 4
             */
            self.generateUUID = function () {};
        }

        return DataStoreFactory;
    }

})(window.angular, window._);

// Source: utils.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.datalayer.utils
     *
     * @description
     * Provides utility functions for the datalayer
     *
     */
    angular.module("sil.datalayer.utils", [])

    .service("silDataLayerUtils", DataLayerUtils);

    /**
     * @ngdoc service
     * @name sil.datalayer.utils:silDataLayerUtils
     * @module sil.datalayer.utils
     *
     *
     * @description
     * Provides utility functions for the datalayer
     */
    function DataLayerUtils() {
        /**
         * @ngdoc method
         * @methodOf sil.datalayer.utils:silDataLayerUtils
         * @name urlJoin
         *
         * @param {...*} urls Url parts to join. The url params should not
         * include query params because it blindly concatenates the
         * arguments using the "/" character
         *
         * @returns {String} The joined URL, including a trailing slash
         *
         * @description
         * Joins url stubs into one url.
         *
         */
        this.urlJoin = function() {
            function endswith(s, c) {
                return s[s.length-1] === c;
            }
            function startswith(s, c) {
                return s[0] === c;
            }

            var SEP = "/";
            var FALSY = [undefined, "", null, SEP];

            return _.reduce(arguments, function(memo, arg) {
                if (_.contains(FALSY, arg)) {
                    return memo;
                }

                var a = arg.toString();

                if (! endswith(a, SEP)) {
                    a += SEP;
                }
                if (startswith(a, SEP) && endswith(memo, SEP)) {
                    a = a.substr(1);
                }
                return memo + a;
            }, "");
        };

        this.makeQueryParams = function (params) {
            // shamelessly copied from
            // angular#toKeyValue and angular#encodeUriQuery (v1.5.0)

            function encodeUriQuery(val) { // angular's version had an extra param here
                return encodeURIComponent(val).
                    replace(/%40/gi, '@').
                    replace(/%3A/gi, ':').
                    replace(/%24/g, '$').
                    replace(/%2C/gi, ',').
                    replace(/%3B/gi, ';').
                    // angular's version had a ternary here
                    replace(/%20/g, '%20');
            }

            var parts = [];
            angular.forEach(params, function(value, key) {
                if (angular.isArray(value)) {
                    angular.forEach(value, function(arrayValue) {
                        parts.push(encodeUriQuery(key, true) +
                           (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
                    });
                } else {
                    parts.push(encodeUriQuery(key, true) +
                       (value === true ? '' : '=' + encodeUriQuery(value, true)));
                }
            });
            return parts.length ? parts.join('&') : '';
        };

        this.breakQueryParams = function (params) {
            // shamelessly copied from
            // angular#parseKeyValue and angular#tryDecodeURIComponent (v1.5.0)
            function tryDecodeURIComponent(value) {
                try {
                    return decodeURIComponent(value);
                } catch (e) {
                    // Ignore any invalid uri component
                }
            }

            var obj = {};
            angular.forEach((params || "").split('&'), function(keyValue) {
                var splitPoint, key, val;
                if (keyValue) {
                    key = keyValue = keyValue.replace(/\+/g,'%20');
                    splitPoint = keyValue.indexOf('=');
                    if (splitPoint !== -1) {
                        key = keyValue.substring(0, splitPoint);
                        val = keyValue.substring(splitPoint + 1);
                    }
                    key = tryDecodeURIComponent(key);
                    if (angular.isDefined(key)) {
                        val = angular.isDefined(val) ? tryDecodeURIComponent(val) : true;
                        if (!hasOwnProperty.call(obj, key)) {
                            obj[key] = val;
                        } else if (angular.isArray(obj[key])) {
                            obj[key].push(val);
                        } else {
                            obj[key] = [obj[key],val];
                        }
                    }
                }
            });
            return obj;
        };
    }

})(window.angular, window._);

// Source: websocket.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.datalayer.websocket
     *
     * @description
     * Implements data transfer using websockets
     *
     */
    angular.module("sil.datalayer.websocket", [])

    .service("silWebSocketBackend", WebSocketBackend);

    /**
     * @ngdoc service
     * @name sil.datalayer.websocket:silWebSocketBackend
     * @module sil.datalayer.websocket
     *
     * @description
     * Handles websockets
     */
    WebSocketBackend.$inject = [];
    function WebSocketBackend() {}
    WebSocketBackend.prototype.register = angular.noop;

})(window.angular);

})(window, document);
