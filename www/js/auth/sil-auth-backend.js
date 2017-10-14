/**
 * sil-auth-backend
 * @version v0.0.1-alpha.7 - 2016-07-29
 * @author SIL <developers@savannahinformatics.com> (http://savannahinformatics.com)
 * @license UNLICENSED
 */
(function(window, document, undefined) {
'use strict';
// Source: module.js
(function (angular) {
angular.module("sil.auth.backend", [
        "sil.actions",
        "sil.authorization",
        "sil.exceptions",
        "sil.determineHomePage",
        "sil.login",
        "sil.oauth2",
        "sil.pageUserRequired",
        "sil.element.actions",
        "sil.session",
        "sil.storage.backend",
        "sil.auth.config",
        "sil.auth.sec"
    ]);

})(window.angular);

// Source: action.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.actions
     *
     * @requires sil.exceptions
     * @requires sil.auth.config
     *
     * @description
     * Framework for performing action related checks
     *
     */
    angular.module("sil.actions", [
        "sil.exceptions",
        "sil.auth.config"
    ])

    /**
     * @ngdoc object
     * @name APP_ACTION_RESTRICT
     * @module sil.actions
     * @description
     * A pointer to the name of the constant that holds a list of action
     * restrictions (strings). The default value is ``ACTIONS.RESTRICT``
     */
    .constant("APP_ACTION_RESTRICT", "ACTIONS.RESTRICT")

    /**
     * @ngdoc object
     * @name APP_ACTION_CHECKERS
     * @module sil.actions
     * @description
     * A pointer to the name of the constant that holds a list of action
     * checkers. The default value is ``ACTIONS.CHECKERS``
     * An action checker is an angular service that exposes one method:
     *
     * 1. **canPerform(action): Boolean** [required]
     *
     *    This method checks whether criteria for the action is met and returns
     *    a boolean.
     */
    .constant("APP_ACTION_CHECKERS", "ACTIONS.CHECKERS")

    /**
     * @ngdoc object
     * @name APP_PAGE_CHECKERS
     * @module sil.actions
     * @description
     * A pointer to the name of the constant that holds a list of page checkers.
     * The default value is ``PAGE.CHECKERS``.
     * A page checker is an angular service that exposes two methods:
     *
     * 1. **canView(fromState, toState): Boolean** [required]
     *
     *     This method shall be used to check whether an action is allowed or not.
     *     The method is expected to return a boolean.
     *
     * 2. **checkFailed(toState, toParams, fromState, fromParams)** [optional]
     *
     *     An optional callback used to handle a failed check
     */
    .constant("APP_PAGE_CHECKERS", "PAGE.CHECKERS")

    .service("sil.actions.actionChecker", ActionChecker)
    .service("sil.actions.hasAction", HasAction)
    .service("sil.actions.pageChecker", PageChecker)
    .service("sil.actions.pageActions", PageActions)
    .service("sil.actions.pageRedirection", PageRedirection);

    /**
     * @ngdoc service
     * @name sil.actions.actionChecker
     * @module sil.actions
     * @requires sil.exceptions.Errors
     * @requires $injector
     * @requires APP_ACTION_RESTRICT
     *
     * @throws {Error} If APP_ACTION_RESTRICT is not an array
     * @description
     * Performs a black-list check where finding a particular
     * action defined in the `APP_ACTION_RESTRICT` array causes access to be
     * denied
     *
     */
    ActionChecker.$inject = [
        "$injector", "APP_ACTION_RESTRICT", "sil.exceptions.Errors"
    ];
    function ActionChecker ($injector, APP_ACTION_RESTRICT, errs) {
        var self = this;
        var has_restrictions = $injector.has(APP_ACTION_RESTRICT);
        var restrictions = [];
        var restrictions_value = has_restrictions ?
            $injector.get(APP_ACTION_RESTRICT): null;
        if (has_restrictions) {
            // assert we have an array
            if (! angular.isArray(restrictions_value)) {
                var err = errs.createError(
                    "sil.actions", errs.ImproperlyConfigured);
                throw err(
                    "actionChecker", APP_ACTION_RESTRICT + " should be an array");
            }
            // load restrictions
            restrictions_value.forEach(function (rest) {
                restrictions.push(rest.toUpperCase());
            });
        }

        /**
         * @ngdoc method
         * @name canPerform
         * @methodOf sil.actions.actionChecker
         * @module sil.actions
         * @param {String} actions
         * The actions required by a particular view or component
         *
         * @returns {Boolean} true to allow access, false to deny access
         * @description Checks if actions provided in a particular view
         *
         */

        self.canPerform = function (actions) {
            // check if application actions have been set
            if (! has_restrictions) {
                return true;  // if none are restricted, all are allowed
            }

            // if actions are in restricted actions
            // return false
            // else
            // return true
            // this is very trivial : does not deal with multiple actions
            return ! _.contains(restrictions, actions.toUpperCase());
        };
    }

    /**
     * @ngdoc service
     * @name sil.actions.hasAction
     * @module sil.actions
     * @requires sil.exceptions.Errors
     * @requires $injector
     * @requires APP_ACTION_CHECKERS
     *
     * @throws {Error} If ACTIONS.CHECKERS is not an array
     * @description Get the available action checkers and iterates through
     * all / some of them to determine if the user has satisfied the
     * required actions.
     */
    HasAction.$inject = [
        "$injector", "APP_ACTION_CHECKERS", "sil.exceptions.Errors"
    ];
    function HasAction ($injector, APP_ACTION_CHECKERS, errs) {
        var self = this;
        var has_checkers = $injector.has(APP_ACTION_CHECKERS);
        var checkers = [];
        var checkers_value = has_checkers ?
            $injector.get(APP_ACTION_CHECKERS) : null;

        if (has_checkers) {
            // Assert we have an array
            if (!angular.isArray(checkers_value)) {
                var err = errs.createError("sil.actions",
                    errs.ImproperlyConfigured);
                throw err("hasAction", APP_ACTION_CHECKERS +
                    " should be an array");
            }

            // Load action checkers
            checkers_value.forEach(function actionCheckersFunction (checker) {
                checkers.push($injector.get(checker));
            });
        }

        /**
         * @ngdoc method
         * @name hasActions
         * @module sil.actions
         * @methodOf sil.actions.hasAction
         * @param {String} actions
         * Contains the actions required by a view or an element
         *
         * @throws {Error} If actions has both an AND and OR splitters
         * @returns {Boolean} true if use has the required actions or false otherwise
         * @description
         * Splits the actions string based on the presence of AND or OR
         * spliters.
         *
         * For an AND action definition the actions param should
         * contain **:** e.g. `action1:action2`. A user must have all the
         * required actions to succefully pass the test.
         *
         * For OR action definition the actions param should contain **;**
         * e.g. `action1;action2`. A user is only required to have at least one
         * action to pass the test.
         *
         * **NOTE:** With OR only one action checker is required to return `true`.
         * If this happens then the remaining ones are ignored.
         *
         */
        self.hasActions = function (actions) {
            var AND = ":";
            var OR = ";";

            if (!_.isString(actions) || _.isEmpty(actions)) {
                // Coz of things like the sil-app-actions directive
                return true;
            }
            // Check if action checkers have been set
            if (!has_checkers) {
                // If none are restricted, all are allowed
                return true;
            }

            var useOr = false;
            var listActions = [actions];

            if (actions.indexOf(AND) !== -1 &&
                    actions.indexOf(OR) !== -1) {

                var err = errs.createError(
                    "sil.actions", errs.ImproperlyConfigured);
                throw err(
                    "hasActions", "You can only use one type of action splitter");

            }

            if (actions.indexOf(AND) !== -1) {
                listActions = actions.split(AND);
            }

            if (actions.indexOf(OR) !== -1) {
                listActions = actions.split(OR);
                useOr = true;
            }

            for (var i = 0; i < listActions.length; i++) {
                var acts = listActions[i].toUpperCase();
                var res = true;
                // for every action check if the user can perform that action
                for (var j = 0; j < checkers.length; j++) {
                    if (!checkers[j].canPerform(acts) && res) {
                        res = false;
                        break;
                    }
                }

                // This is an OR check. Where if any checker passes a user is
                // allowed access
                if (res && useOr) {
                    return true;
                }
                // This is specific to AND. There is no need to move to another
                // checker if one already has failed
                if (!(res || useOr)) {
                    return false;
                }

            }
            return useOr ? false : true;
        };
    }

    /**
     * @ngdoc service
     * @name sil.actions.pageChecker
     * @module sil.actions
     * @requires sil.exceptions.Errors
     * @requires $injector
     * @requires $rootScope
     * @requires APP_PAGE_CHECKERS
     *
     * @throws {Error} If APP_PAGE_CHECKERS is not an array
     *
     * @description
     * Perfoms checks on pages actions when a `stateChangeStart` event is fired
     */
    PageChecker.$inject = [
        "$injector", "$rootScope", "APP_PAGE_CHECKERS", "sil.exceptions.Errors"
    ];
    function PageChecker ($injector, $rootScope, APP_PAGE_CHECKERS, errs) {
        var evtListener = null;
        var has_checkers = $injector.has(APP_PAGE_CHECKERS);
        var checkers = [];
        var checkers_value = has_checkers ?
            $injector.get(APP_PAGE_CHECKERS) : null;

        if (has_checkers) {
            // assert we have an array
            if (!angular.isArray(checkers_value)) {
                var err = errs.createError("sil.actions", errs.ImproperlyConfigured);
                throw err("pageChecker", APP_PAGE_CHECKERS + " should be an array");
            }

            // load action checkers
            checkers_value.forEach(function (checker) {
                checkers.push($injector.get(checker));
            });
        }

        var defaultCheckFail = angular.noop;


        /**
         * @ngdoc method
         * @methodOf sil.actions.pageChecker
         * @name canViewPage
         * @module sil.actions
         *
         * @param {Object} fromState
         * State from which we are transitioning from
         * @param {Object} toState
         * State from which we are transitioning to
         *
         * @returns {Object}
         * An object with the following properties:
         *      - can_view {Boolean} Whether the user can view or not
         *      - callback {Function} Callback to be used when check failed
         *
         * @description
         * Determines if the user is allowed to view a particular page. It runs
         * through the configured {@link APP_PAGE_CHECKERS page checkers}
         * using the ``canView`` method from each checker.
         * If any checker fails, callback is set to the failed checker's
         * ``checkFailed`` method.
         */

        this.canViewPage = function (fromState, toState) {
            var ans = {
                "can_view": true
            };

            if (has_checkers) {
                for (var i = 0; i < checkers.length; i++) {
                    var val = checkers[i].canView(fromState, toState);
                    if (! val) {
                        ans.can_view = false;
                        ans.callback = checkers[i].checkFailed || defaultCheckFail;
                        return ans;
                    }
                }
            }
            return ans;
        };

        /**
         * @ngdoc method
         * @methodOf sil.actions.pageChecker
         * @name startListening
         * @module sil.actions
         *
         * @description
         * Listens on the `$stateChangeStart` event and begins the
         * process of determining if a user has the required actions to view the
         * page
         */
        this.startListening = function () {
            var self = this;
            evtListener = $rootScope.$on("$stateChangeStart",
                function (evt, toState, toParams, fromState, fromParams) {
                    var ans = self.canViewPage(fromState, toState);
                    if (! ans.can_view) {
                        evt.preventDefault();
                        ans.callback(toState, toParams, fromState, fromParams);
                    }
                }
            );
        };

        /**
         * @ngdoc method
         * @name stopListening
         * @module sil.actions
         * @methodOf sil.actions.pageChecker
         * @description Stops listening to the `stateChangeStart` event
         */
        this.stopListening = function () {
            if (_.isNull(evtListener)) {
                return;
            }
            evtListener();
            evtListener = null;
        };
    }


    /**
     * @ngdoc service
     * @name sil.actions.pageActions
     * @module sil.actions
     * @requires sil.actions.hasAction
     * @requires $injector
     * @requires sil.auth.backend.setup
     *
     * @description
     * Defines a page checker that checks that a user has the required actions
     *  to view a particular page
     */
    PageActions.$inject = [
        "sil.actions.hasAction", "$injector", "sil.auth.backend.setup"
    ];
    function PageActions (hasAction, $injector, setupConfig) {
        var self = this;

        /**
         * @ngdoc method
         * @name canView
         * @module sil.actions
         * @methodOf sil.actions.pageActions
         *
         * @param {Object} fromState
         * State from which we are transitioning from
         * @param {Object} toState
         * State from which we are transitioning to
         *
         * @returns {Boolean} true if user can view page, false otherwise
         * @description Checks that a user meets the conditions to perform
         * the actions required by a page. The actions are defined on the
         * `data` object of the state definition.
         */
        self.canView = function  (fromState, toState) {
            if (_.has(toState, "data")) {
                var actions = toState.data.actions;

                return hasAction.hasActions(actions);
            }
            return true;
        };

        /**
         * @ngdoc method
         * @name checkFailed
         * @module sil.actions
         * @methodOf sil.actions.pageActions
         *
         * @description
         * This method is called when this check fails. Basically
         * it redirects the user to a 403 error page.
         */
        self.checkFailed = function () {
            var $state = $injector.get("$state");
            $state.go(setupConfig.authStates.error403);
        };
    }

    /**
     * @ngdoc service
     * @name sil.actions.pageRedirection
     * @module sil.actions
     * @requires $state
     *
     * @description
     * Redirects to a state defined
     */
    PageRedirection.$inject = ["$state"];
    function PageRedirection ($state) {
        var self = this;

        /**
         * @ngdoc method
         * @name getRedirectState
         * @module sil.actions
         * @methodOf sil.actions.pageRedirection
         *
         * @param {Object} state
         * The state object to look for redirect state definition
         * @param {string} [state.redirectTo=undefined]
         * Redirect state definition
         * @param {string} [state.data.redirectTo=undefined]
         * Redirect state definition
         *
         * @returns {String|null} The next state to redirect to or null if none
         *
         * @description
         * Checks the ``redirectTo`` and ``data.redirectTo`` properties of the
         * state and returns the value.
         * If both are defined, ``redirectTo`` shall take precedence.
         * If none are defined, ``null`` is returned
         *
         */
        self.getRedirectState = function (state) {
            return state.redirectTo ||
                (state.data ? state.data.redirectTo : null) ||
                null;
        };

        /**
         * @ngdoc method
         * @name canView
         * @module sil.actions
         * @methodOf sil.actions.pageRedirection
         *
         * @param {Object} fromState
         * State from which we are transitioning from
         * @param {Object} toState
         * State from which we are transitioning to
         *
         * @returns {Boolean} false if redirect is available, true otherwise
         *
         * @description
         * Checks that there's a redirection to another state
         */
        self.canView = function  (fromState, toState) {
            return ! self.getRedirectState(toState);
        };

        /**
         * @ngdoc method
         * @name checkFailed
         * @module sil.actions
         * @methodOf sil.actions.pageRedirection
         *
         * @description
         * This method is called when a redirect is available.
         * It redirects to the state defined for redirection
         */
        self.checkFailed = function (toState) {
            $state.go(self.getRedirectState(toState));
        };
    }
})(window.angular, window._);

// Source: authorization.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.authorization
     *
     * @requires sil.oauth2
     * @requires sil.exceptions
     *
     * @description
     * This module is concerned with authorization checks of logged In users
     *
     */
    angular.module("sil.authorization", [
        "sil.oauth2",
        "sil.exceptions"
    ])

    .service("sil.authorization.actionChecker", ActionChecker);

    /**
     * @ngdoc service
     * @name sil.authorization.actionChecker
     * @module sil.authorization
     * @requires $injector
     * @requires $log
     * @requires sil.oauth2.authConfig
     * @requires sil.exceptions.Errors
     *
     * @description
     * Checks if user has the required actions. An action is composed of one or
     * more permissions.
     *
     */
    ActionChecker.$inject = [
        "$injector", "$log", "sil.oauth2.authConfig", "sil.exceptions.Errors"
    ];
    function ActionChecker ($injector, $log, authConfig, errs) {
        var self = this;

        /**
         * @ngdoc method
         * @name hasPermissions
         * @module sil.authorization
         * @methodOf sil.authorization.actionChecker
         * @param {Array} perms An array of permission strings
         *
         * @returns {Boolean} true if user has the required permissions for the
         * action, false otherwise
         * @description Checks if a user has all the required permissions required
         * for a particular action.
         *
         */
        self.hasPermissions = function (perms) {
            var user = authConfig.getUser();
            if (_.isNull(user)) {
                return false;
            }
            var union = _.union(user.permissions, perms);
            return union.length === user.permissions.length;
        };

        /**
         * @ngdoc method
         * @name canPerform
         * @module sil.authorization
         * @methodOf sil.authorization.actionChecker
         * @param {Object} action Defines an action and its attributes
         *
         * @throws {Error} if the action defined doesn't have a module defining it.
         * @throws {Error} if an action has no permissions defined
         * @returns {Boolean} true to allow access, false otherwise
         * @description
         * It extracts permissions from the action object and passes them to
         * {@link sil.authorization.actionChecker#methods_hasPermissions hasPermissions}
         * to check if a user has permissions that are required by the action
         */
        self.canPerform = function (action) {

            var inject_val = action.toUpperCase();
            $log.debug("authorization check : " + inject_val);

            if (! $injector.has(inject_val)) {
                throw errs.createError(
                    "sil.authorization", errs.ImproperlyConfigured)
                ("actionChecker.badaction", "no action like : '" + action + "'");
            }

            var act = $injector.get(inject_val);
            $log.debug("authorization perm : " + act.perm);

            if (_.isUndefined(act.perm)) {
                return true;
            }
            if (! angular.isString(act.perm) || _.isEmpty(act.perm)) {
                throw errs.createError(
                    "sil.authorization", errs.ImproperlyConfigured
                )(
                    "actionChecker.badperm",
                    "Action permission: '" +
                    action + "' should be a non-empty string"
                );
            }
            return self.hasPermissions(act.perm.split(','));
        };
    }

})(window.angular, window._);

// Source: config.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.auth.config
     * @description Provides a way to configure variables that
     * are deemed to change between applications
     *
     */
    angular.module("sil.auth.config", [])

    .provider("sil.auth.backend.setup", Setup);

    /**
     * @ngdoc service
     * @name sil.auth.backend.setupProvider
     * @module sil.auth.config
     *
     * @description
     * Setup of values used across `sil.auth.backends`
     */
    function Setup() {
        var self = this;
        var authStates = {
            "loginState": "login",
            "logoutState": "logout",
            "error403": "error_403"
        };

        var setStuff = function (vars, config, obj) {
            vars.forEach(function (v) {
                var cfg = config[v];
                if (!_.isString(cfg)) {
                    return;
                }
                obj[v] = cfg;
            });
        };

        /**
         * @ngdoc method
         * @name setStates
         * @module sil.auth.config
         * @methodOf sil.auth.backend.setupProvider
         *
         * @description
         * Allows login, logout and error states to be set
         */
        self.setStates = function (obj) {
            var keys = Object.keys(authStates);
            setStuff(keys, obj, authStates);
        };

        /**
         * @ngdoc service
         * @name sil.auth.backend.setup
         * @module sil.auth.config
         *
         * @description
         * Retrieves values set via the provider
         */
        this.$get = function () {
            return {
                /**
                 * @ngdoc property
                 * @name authStates
                 * @module sil.auth.config
                 * @propertyOf sil.auth.backend.setup
                 *
                 * @description
                 * Retrieves auth states
                 */
                "authStates": authStates
            };
        };
    }

})(window.angular, window._);

// Source: exceptions.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.exceptions
     * @description
     * Provides a uniform way to throw and handle errors
     *
     * Inspired by angular's minErr
     */
    angular.module("sil.exceptions", [])
    .provider("sil.exceptions.Errors", SilExceptionProvider);


    /**
     * @ngdoc service
     * @name sil.exceptions.ErrorsProvider
     * @module sil.exceptions
     *
     */
    function SilExceptionProvider () {
        var self = this;

        /**
         * @ngdoc service
         * @name sil.exceptions.Errors
         * @module sil.exceptions
         */
        self.$get = [function () {
            return {

                /**
                 * @ngdoc property
                 * @name ImproperlyConfigured
                 * @propertyOf sil.exceptions.Errors
                 * @description
                 * Defines a JS error object that is later thrown by the calling function
                 *
                 */
                "ImproperlyConfigured": "ImproperlyConfigured",
                "createError": createError
            };
        }];
    }

    /**
     * @ngdoc method
     * @name createError
     * @methodOf sil.exceptions.Errors
     *
     * @param {String} module
     * The module that has thrown the error
     * @param {String} [err_name="Error"]
     * What the error occured was.
     *
     * @description
     * Defines a JS error object
     *
     * @returns {Function} creator
     */
    function createError (module, err_name) {
        var name = err_name || "Error";
        var creator = function creatorFunction (code, message) {
            var prefix = "[" + (module ? module + ":" : "") + code + "] ";
            var msg = prefix + name + " : " + message;
            return new Error(msg);
        };
        return creator;
    }
})(window.angular);

// Source: home_page.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.determineHomePage
     * @requires sil.actions
     * @requires sil.oauth2
     * @requires sil.auth.config
     * @description An app can have many possible homepages. This module helps
     * select one based on the actions required to view the homepage and if the
     * user has the required permissions to match the action.
     *
     */

    angular.module("sil.determineHomePage", [
        "sil.actions",
        "sil.oauth2",
        "sil.auth.config"
    ])

    .service("sil.determineHomePage.homePage", HomePage);

    /**
     *
     * @ngdoc service
     * @name sil.determineHomePage.homePage
     * @module sil.determineHomePage
     * @requires sil.oauth2.authConfig
     * @requires sil.actions.hasAction
     * @requires AVAILABLE_HOMEPAGES
     * @requires sil.auth.backend.setup
     * @requires $state
     *
     *
     * @description
     * A service that uses the actions that a user has to
     * determine the homepage for a user. The service performs a cascade
     * starting with the common homepages as it moves to the rare ones
     *
     */

    HomePage.$inject = [
        "AVAILABLE_HOMEPAGES", "sil.oauth2.authConfig",
        "sil.actions.hasAction", "$state", "sil.auth.backend.setup",
    ];
    function HomePage (homePages, authConfig, hasAction, $state, setupConfig) {
        this.determineHomePage = function () {
            if (authConfig.isLoggedIn()) {
                for ( var i = 0; i < homePages.length; i++) {
                    var stateConf = $state.get(homePages[i]);
                    var stateActions = "";
                    if (_.has(stateConf, "data")) {
                        stateActions = stateConf.data.actions;
                    }
                    var result = hasAction.hasActions(stateActions);
                    if (result) {
                        return homePages[i];
                    }
                }
                return setupConfig.authStates.error403;
            }
            return setupConfig.authStates.loginState;
        };

    }
})(window.angular, window._);

// Source: login.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.login
     * @requires sil.determineHomePage
     * @requires sil.oauth2
     * @requires sil.datalayer.utils
     * @requires sil.session
     * @requires sil.auth.backend.config
     *
     * @description
     * Makes use of the authentication module to perform the login dance.
     */
    angular.module("sil.login", [
        "sil.determineHomePage",
        "sil.oauth2",
        "sil.datalayer.utils",
        "sil.session",
        "sil.auth.config"
    ])

    .service("sil.login.complete", CompleteService);

    LoginButton.$inject = ["sil.oauth2.authConfig"];
    function LoginButton (authConfig) {
        var self = this;
        self.loginUrl = authConfig.loginUrl();
    }

    UserDetails.$inject = [
        "$state","sil.oauth2.authConfig", "$rootScope", "sil.session.manager",
        "sil.auth.backend.setup"
    ];
    function UserDetails ($state, authConfig, $rootScope, session, setupConfig) {
        var self = this;

        self.$onInit = function () {
            var currUser = authConfig.getUser();

            if (currUser) {
                self.displayName = currUser.first_name + " " + currUser.last_name;
            }

            $rootScope.$on("IdleTimeout", function () {
                // prevents a loop
                if (authConfig.isLoggedIn() ||
                    $state.current.name !== setupConfig.authStates.loginState) {
                    session.dumpState($state.current, $state.params);
                    $state.go(
                        setupConfig.authStates.logoutState,
                        {"timeout": "true"}
                    );
                }
            });
        };
    }

    /**
     * @ngdoc service
     * @name sil.login.complete
     * @module sil.login
     * @requires $location
     * @requires $state
     * @requires sil.oauth2.authConfig
     * @requires $stateParams
     * @requires sil.session.manager
     * @requires $q
     * @requires sil.determineHomePage.homePage
     * @requires silDataLayerUtils
     *
     * @description
     * Does all the necessary processing after the redirection occurs from the
     * authServer
     */
    CompleteService.$inject = [
        "$location", "$state", "sil.oauth2.authConfig", "$stateParams",
        "sil.session.manager", "$q", "sil.determineHomePage.homePage",
        "silDataLayerUtils"
    ];
    function CompleteService ($location, $state, authConfig, $stateParams,
        session, $q, homePageServ, utils) {

        var self = this;

        /**
         * @ngdoc method
         * @name completeAuth
         * @module sil.login
         * @methodOf sil.login.complete
         *
         * @return {Promise}
         * Promise that resovles once authentication is complete
         *
         * @description
         * Gets the location hash which is processed to get the token details
         * which are then stored in the localStorage.
         * After fetching and storing the token details successfully this
         * the detail of the user who logged in are also fetched and stored in
         * localStorage.
         * The final step is to determine which page to redirect the user to.
         *
         * **NOTE:** The promised returned defines notify which can be used
         *           to determine the step at which the overall process is at.
         *
         */
        self.completeAuth = function () {
            var raw_auth_info = $location.hash();
            $location.hash("");
            var deferred = $q.defer();
            deferred.notify("loading authentication...");
            var loadUser = function () {
                deferred.notify("loading user info...");
                authConfig.setUserDetails()
                .then(function () {
                    deferred.notify("starting session...");
                    try {
                        var load_state = session.loadState();
                        session.clearState();
                        if (load_state) {
                            $state.go(load_state.name, load_state.params);
                        } else {
                            var nxt = homePageServ.determineHomePage();
                            $state.go(nxt);
                        }
                        deferred.resolve();
                    } catch (e) {
                        deferred.reject("Login not complete");
                    }
                }, function (err) {
                    deferred.reject(
                        "error fetching user info : " + JSON.stringify(err));
                });
            };
            var token = utils.breakQueryParams(raw_auth_info);
            authConfig.setAuthDetails(token, $stateParams)
            .then(loadUser, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        };
    }

})(window.angular);

// Source: oauth2.js
(function (angular, _, moment, jQuery) {
/**
     * @ngdoc overview
     * @name sil.oauth2
     * @requires sil.storage.backend
     * @requires sil.exceptions
     * @requires sil.datalayer.utils
     *
     * @description
     * All the token, user, credentials, authentication, storing of tokens,
     * and user details happens here.
     */
    angular.module("sil.oauth2", [
        "sil.storage.backend",
        "sil.exceptions",
        "sil.datalayer.utils"
    ])

    /**
     * @ngdoc service
     * @name sil.oauth2.authConfigProvider
     * @module sil.oauth2
     *
     * @description
     * Configuration for the service
     */
    .provider("sil.oauth2.authConfig", AuthConfigProvider);

    function AuthConfigProvider () {
        var token_timeout = 10 * 1000;
        // var USER_STORE = "auth.config.user";
        var USER_STORE = "auth.config.credz";
        var CREDZ_STORE = "auth.config.credz";
        var AUTH_URLS = {
            domain: "http://localhost:9000",
            token: "/oauth2/token/",
            authorize: "/oauth2/authorize/",
            revoke: "/oauth2/revoke_token/",
            redirect: "/complete/",
            user_info: "/v1/user/me/",
            passwordReset: "/accounts/password/reset/",
            passwordResetConfirm: "/accounts/password/reset/confirm/",
            passwordChange: "/accounts/password/change/"
        };
        var OAUTH_CREDZ = {
            response_type: "token",
            client_id: "",
            grant_type: "implicit",
            approval_prompt: "auto",
            // TODO: Add state
        };
        var OAUTH_SCOPES = [];
        var setStuff = function (vars, config, obj) {
            vars.forEach(function (v) {
                var cfg = config[v];
                if (_.isUndefined(config[v])) {
                    return;
                }
                obj[v] = cfg;
            });
        };
        /**
         * @ngdoc method
         * @name setAuthUrls
         * @module sil.oauth2
         * @methodOf sil.oauth2.authConfigProvider
         *
         * @param {Object} config
         * The urls to configure
         *
         * @description
         * Allows the `AUTH_URLS` to be editted before the appplication is
         * bootstrapped. The configurable `AUTH_URLS` attributes are:
         * `domain`, `token`, `authorize`, `revoke`, `redirect`, `passwordReset`,
         * `passwordResetConfirm` and `passwordChange`.
         */
        this.setAuthUrls = function(config) {
            var vars = [
                "domain", "token", "authorize", "revoke", "redirect", "user_info",
                "passwordReset", "passwordResetConfirm", "passwordChange"
            ];
            setStuff(vars, config, AUTH_URLS);
        };

        /**
         * @ngdoc method
         * @name setOAuthCredz
         * @module sil.oauth2
         * @methodOf sil.oauth2.authConfigProvider
         *
         * @param {Object} config
         * The values to configure
         *
         * @description
         * Allows the `OAUTH_CREDZ` to be editted before the appplication is
         * bootstrapped. The configurable `OAUTH_CREDZ` attributes are:
         * `client_id` and `approval_prompt`
         */
        this.setOAuthCredz = function (config) {
            var vars = ["client_id", "approval_prompt"];
            setStuff(vars, config, OAUTH_CREDZ);
        };
        /**
         * @ngdoc method
         * @name setScopes
         * @module sil.oauth2
         * @methodOf sil.oauth2.authConfigProvider
         *
         * @param {Array<string>} scopes
         * The scopes to set
         *
         * @description
         * Allows the `OAUTH_SCOPES` to be editted before the appplication is
         * bootstrapped. The scopes passed must be an array.
         */
        this.setScopes = function (scopes) {
            OAUTH_SCOPES = scopes;
        };

        /**
         * @ngdoc service
         * @name sil.oauth2.authConfig
         * @module sil.oauth2
         *
         * @description
         * Performs authentication and storage
         */
        this.$get = [
            "$window", "$interval", "silDataLayerUtils", "$http", "$q",
            "sil.storage.backend.localstorage", "sil.exceptions.Errors",
            function ($window, $interval, urlhelpers, $http, $q, storage, errs) {

                if (! _.isArray(OAUTH_SCOPES)) {
                    var err = errs.createError(
                        "sil.oauth2", errs.ImproperlyConfigured);
                    throw err("setScopes", "scopes should be an array");
                }

                OAUTH_SCOPES = _.uniq(OAUTH_SCOPES);

                return {
                    /**
                     * @ngdoc method
                     * @name loginUrl
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     *
                     * @return {String} The url to the auth server
                     * @description
                     * Composes the loginUrl that redirects to the authentication
                     * server.
                     */
                    loginUrl: function () {
                        var url = urlhelpers.urlJoin(
                            AUTH_URLS.domain, AUTH_URLS.authorize);
                        var origin = $window.location.origin;
                        var params = {
                            "redirect_url" : urlhelpers.urlJoin(
                                origin, AUTH_URLS.redirect),
                            "approval_prompt": OAUTH_CREDZ.approval_prompt,
                            "scope": OAUTH_SCOPES.join(" "),
                            "client_id": OAUTH_CREDZ.client_id,
                            "grant_type": OAUTH_CREDZ.grant_type,
                            "response_type": OAUTH_CREDZ.response_type
                        };
                        var q_params = urlhelpers.makeQueryParams(params);
                        return url + "?" + q_params;
                    },

                    /**
                     * @ngdoc method
                     * @name setAuthDetails
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     *
                     * @param {Object} token
                     * Token to persist
                     * @param {Object} urlParams
                     * URL parameters from the authserver
                     *
                     * @return {Promise}
                     * Promise that resolves if urlparams don't have a server
                     * error and token is persisted succesfully
                     *
                     * @description
                     * Set the token retrieved from the server e.g.
                     * via redirect url hash (implicit grant) or JSON response
                     * (client credentials, resource owner).
                     * The token is then stored in the localStorage.
                     */
                    setAuthDetails: function (token, urlParams) {
                        if (!(angular.isObject(token) &&
                                angular.isObject(urlParams))) {

                            var err = errs.createError("sil.oauth2");
                            throw err(
                                "authConfig.setAuthDetails",
                                "token and urlParams should be objects"
                            );
                        }
                        var defered = $q.defer();
                        var login_error = urlParams.error;
                        if (login_error) {
                            defered.reject(
                                "authentication failed : " + login_error);
                            return defered.promise;
                        }
                        // oauthlib.oauth2.rfc6749.grant_types.implicit:228
                        // oauthlib.oauth2.rfc6749.grant_types.implicit:232

                        if (!_.isEmpty(token)) {
                            if (token.error) {
                                defered.reject(token.error);
                                return defered.promise;
                            }
                            var updated_token = angular.copy(token);
                            this.storeToken(updated_token);
                            defered.resolve(updated_token);
                        } else {
                            defered.resolve(token);
                        }
                        return defered.promise;
                    },
                    /**
                     * @ngdoc method
                     * @name setXHRToken
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     * @param {Object} token
                     * Token to set in $http and jQuery.ajax
                     *
                     * @description
                     * Add the token to the headers so that the token is included in
                     * every request made to the resource server.
                     */
                    setXHRToken: function (token) {
                        if (_.isUndefined(token) || _.isNull(token)) {
                            return;
                        }
                        var auth_token = token.token_type + " " + token.access_token;
                        $http.defaults.headers.common.Authorization = auth_token;
                        /* istanbul ignore if  */
                        if (!_.isUndefined(jQuery)) {
                            /*jQuery.ajaxSetup({
                            });*/
                            var headers = { Authorization: auth_token };
                            console.log(headers);
                        }
                    },
                    /**
                     * @ngdoc method
                     * @name storeToken
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     * @param {Object} token
                     * Token to persist
                     *
                     * @description
                     * Sets to be included in every request and also stores in
                     * in localStorage. An event to refresh tokens is also set
                     * and does so 10 mins before the token expires.
                     */
                    storeToken: function (token) {
                        this.setXHRToken(token);
                        var self = this;
                        var till = moment().add(token.expires_in, "seconds");
                        token.expire_at = till;
                        storage.setItem(CREDZ_STORE, token);
                        // Refresh token before it expires
                        var stop = $interval(function() {
                            self.refreshToken(token);
                            $interval.cancel(stop);
                        }, (parseInt(token.expires_in, 10) * 1000) - token_timeout);
                    },
                    /**
                     * @ngdoc method
                     * @name refreshToken
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     *
                     * @description
                     *  Stub to what will be a way to refresh implicit tokens
                     *
                     *
                     */
                     //TODO: stub dont return anything
                     // https://github.com/JamesRandall/AngularJS-OAuth2#silent-token-renewal
                    refreshToken:  angular.noop,
                    /**
                     * @ngdoc method
                     * @name revokeToken
                     * @module sil.oauth2
                     * @methodOf sil.oauth2.authConfig
                     *
                     * @param {Object} token
                     * Token to revoke
                     *
                     * @returns {Promise}
                     * Promise that resolves when the token is revoked
                     *
                     * @description
                     * Revokes the token and clears localStorage to remove
                     * user and credential details
                     */
                    revokeToken: function (token) {
                        var url = urlhelpers.urlJoin(
                            AUTH_URLS.domain, AUTH_URLS.revoke);
                        storage.removeItem(CREDZ_STORE);

                        if (!angular.isObject(token)) {
                            return $q.when(null);
                        }
                        var payload =
                            "token=" + token.access_token +
                            "&client_id=" + OAUTH_CREDZ.client_id;

                        return $http({
                            data: payload,
                            headers: {
                                "Authorization" : token.token_type + " " +
                                token.access_token,
                                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
                            },
                            method: "POST",
                            url: url
                        });
                   },
                   /**
                    * @ngdoc method
                    * @name getToken
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    *
                    * @return {Object|null}
                    * Persisted token or null
                    *
                    * @description
                    * fetches a token stored in local storage.
                    */
                    getToken: function () {
                        var token = storage.getItem(CREDZ_STORE);
                        if (!_.isNull(token)) {
                            if (moment(token.expire_at) > moment()
                                .add(token_timeout, "ms")) {
                                return token;
                            }
                            storage.removeItem(CREDZ_STORE);
                        }
                        return null;
                    },
                   /**
                    * @ngdoc method
                    * @name changePassword
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    * @param {Object} obj
                    * Contains the current password and the new password typed
                    * twice for verification.
                    *
                    * @return {Promise}
                    * Promise that resolves once password change is successful
                    *
                    * @description
                    * Allows a logged in user to change their password to a new
                    * password. The `current password` cannot be set as the
                    * `new password`.
                    */
                   changePassword : function (obj) {
                       var url = urlhelpers.urlJoin(
                           AUTH_URLS.domain, AUTH_URLS.passwordChange);
                       return $http.post(url, obj);
                   },
                   /**
                    * @ngdoc method
                    * @name setUserDetails
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    *
                    * @return {Promise}
                    * Promise that resolves once user details are fetched and
                    * stored
                    *
                    * @description
                    * Uses the `me` endpoint to get the details of the currently
                    * logged in user and stores all the details in localStorage.
                    *
                    */
                   setUserDetails : function () {
                       var url = urlhelpers.urlJoin(
                           AUTH_URLS.domain, AUTH_URLS.user_info);
                       return $http.get(url)
                           .then(function dataFunction (data) {
                               storage.setItem(
                                   USER_STORE, data.data);
                               return data;
                           });
                   },
                   /**
                    * @ngdoc method
                    * @name getUser
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    *
                    * @return {Object} the object containing a users details
                    * @description
                    * Retrieves the users details stored in local storage.
                    *
                    */
                   getUser : function () {
                       return storage.getItem(USER_STORE);
                   },
                   /**
                    * @ngdoc method
                    * @name isLoggedIn
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    *
                    * @return {Boolean}
                    * True if the user is logged in and false otherwise.
                    * @description
                    * Checks if there is a user currently logged in to the
                    * application. It does so by checking that a token and
                    * user details are stored in localStorage.
                    *
                    */
                   isLoggedIn : function () {
                       var user = this.getUser();
                       var has_token = this.getToken();
                       return (!_.isNull(user)) && (!_.isNull(has_token));
                   },
                   /**
                    * @ngdoc method
                    * @name logout
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    *
                    * @return {Promise}
                    *  Can be rosolved to see if a token was successfully revoked.
                    *
                    * @description
                    * Logs out a user and ends the session. It does so by revoking
                    * the token and deleting the user and token details from the
                    * localStorage
                    */
                   logout : function () {
                       storage.removeItem(USER_STORE);
                       return this.revokeToken(this.getToken());
                   },
                   /**
                    * @ngdoc method
                    * @name resetPassword
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    * @param {String} email
                    * Email of the user to reset password
                    *
                    * @return {Promise}
                    * Can be rosolved to see if a password reset request was
                    * successful.
                    *
                    * @description
                    * Takes an e-mail and if it matches one in the resource backend
                    * sends the user a reset url to begin the password reset process
                    */
                   resetPassword : function (email) {
                       var url = urlhelpers.urlJoin(
                           AUTH_URLS.domain, AUTH_URLS.passwordReset);
                       return $http.post(url, {"email": email});
                   },
                   /**
                    * @ngdoc method
                    * @name resetPasswordConfirm
                    * @module sil.oauth2
                    * @methodOf sil.oauth2.authConfig
                    * @param {Object} obj
                    * Contains `new password` and a verification of the password
                    *
                    * @return {Promise} Can be rosolved to see if a password reset
                    * was successful
                    *
                    * @description
                    * Resets the users password.
                    */
                   resetPasswordConfirm : function (obj) {
                       var url = urlhelpers.urlJoin(
                           AUTH_URLS.domain, AUTH_URLS.passwordResetConfirm);
                       return $http.post(url, obj);
                   }
                };
            }
        ];
    }
})(window.angular, window._, window.moment, window.jQuery);

// Source: page_user_required.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.pageUserRequired
     * @requires ui.router
     * @requires sil.oauth2
     * @requires sil.session
     * @requires sil.auth.config
     *
     */

    angular.module("sil.pageUserRequired", [
        "ui.router",
        "sil.oauth2",
        "sil.session",
        "sil.auth.config"
    ])

    .service("sil.authentication.pageUserRequired", PageUserRequired);

    /**
     * @ngdoc service
     * @name sil.authentication.pageUserRequired
     * @module sil.pageUserRequired
     * @requires $injector
     * @requires sil.oauth2.authConfig
     * @requires sil.session.manager
     * @requires sil.auth.backend.setup
     *
     * @description
     * Defines `canView` and `checkFailed` function that are required for
     * page Checkers
     */
    PageUserRequired.$inject = [
        "$injector", "sil.oauth2.authConfig", "sil.session.manager",
        "sil.auth.backend.setup"
    ];
    function PageUserRequired ($injector, authConfig, session, setupConfig) {
        var self = this;
        /**
         * @ngdoc method
         * @name canView
         * @module sil.pageUserRequired
         * @methodOf sil.authentication.pageUserRequired
         * @param {Object} fromState. This is the current State
         * @param {Object} toState. This is the destination state
         * @returns {Boolen} true if user is logged in, false otherwise
         * @description
         * Checks if a the destination page requires a loggedin User.
         * This functioin returns true if the user is logged in on pages that
         * require a logged in user. It returns false if the page requires a
         * user and none is logged in. Otherwise true is returned for any page
         * that doesnt require a user.
         * By default all pages are assumed to require a user.
         * In order to specify that a page doesnt require a user a the following
         * attribute (noRequireUser) to the state definition.
         *
         * @example
         *
         *  ``` javascript
         *
         *      angular.config(["$stateProvider", function ($stateProvider) {
         *            $stateProvider
         *                .state("state_name", {
         *                    data: {
         *                        requireUser: false
         *                    }
         *                });
         *  ```
         */

        self.canView = function (fromState, toState) {
            var notRequireUser = false;

            if (_.has(toState, "data")) {
                notRequireUser = toState.data.requireUser === false;
            }
            var isLoggedIn = authConfig.isLoggedIn();

            if (!notRequireUser && !isLoggedIn) {
                return false;
            }
            return true;
        };

        /**
         * @ngdoc method
         * @name checkFailed
         * @module sil.pageUserRequired
         * @methodOf sil.authentication.pageUserRequired
         * @param {Object} fromParams. This are stateParams of the origination state
         * @param {Object} toParams. This are stateParams of the destination state
         *
         * @description
         * This is called to redirect users to the log in page if they try
         * to access a page they have no access to.
         * The state the user was trying to access is stored allowing them to
         * resume to the exact page they were on/ they were trying to visit.
         */
        self.checkFailed = function (toState, toParams) {
            var $state = $injector.get("$state");
            session.dumpState(toState, toParams);
            $state.go(setupConfig.authStates.loginState);
        };

    }
})(window.angular);

// Source: security.js
(function (angular) {

/**
     * @ngdoc overview
     * @name sil.auth.sec
     *
     * @description
     * Implements some sort of client-side data security
     *
     */
    angular.module("sil.auth.sec", [])

    .service("silAuthSec", AuthSec);

    /**
     * @ngdoc service
     * @name sil.auth.sec:silAuthSec
     * @module sil.auth.sec
     *
     * @description
     * Provides methods to encode/encrypt and decode/decrypt strings
     *
     * Some inspiration:
     * - github.com/bealearts/secure-storage-js
     * - github.com/bitwiseshiftleft/sjcl
     */
    function AuthSec() {
    }

    /**
     * @ngdoc method
     * @methodOf sil.auth.sec:silAuthSec
     * @name encode
     *
     * @param {String} plaintext The plaintext to encode
     *
     * @returns {String} The encoded ciphertext
     *
     * @description
     * Converts plaintext to ciphertext
     */
    AuthSec.prototype.encode = function (plaintext) {
        return plaintext;
    };

    /**
     * @ngdoc method
     * @methodOf sil.auth.sec:silAuthSec
     * @name decode
     *
     * @param {String} ciphertext The ciphertext to encode
     *
     * @returns {String} The decode plaintext
     *
     * @description
     * Converts ciphertext to plaintext
     */
    AuthSec.prototype.decode = function (ciphertext) {
        return ciphertext;
    };

    /**
     * @ngdoc method
     * @methodOf sil.auth.sec:silAuthSec
     * @name createHash
     *
     * @returns {String} The hashed string
     *
     * @description
     * Create a sha-256 hash based on the current time.
     */
    AuthSec.prototype.createHash = function () {
        return "ciphertext";
    };

})(window.angular);

// Source: session.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.session
     * @requires sil.oauth2
     * @requires sil.storage.backend
     * @requires sil.exceptions
     * @requires ngIdle
     *
     * @description
     * Provides a way to manage a users session.
     */

    angular.module("sil.session", [
        "sil.oauth2",
        "sil.storage.backend",
        "sil.exceptions",
        "ngIdle"
    ])


    .service("sil.session.manager", Login);

    /**
     * @ngdoc service
     * @name sil.session.manager
     * @module sil.session
     * @requires Title
     * @requires Idle
     * @requires silLocalStorageBackend
     * @requires sil.oauth2.authConfig
     * @description
     * Defines methods to handle ng-idle and storing user sessions
     */
    Login.$inject = [
        "Title", "Idle", "sil.storage.backend.localstorage",
        "sil.oauth2.authConfig",
    ];
    function Login (title, idle, storage, authConfig) {
        var STATE_STORE =  "state.dump";
        var self = this;

        /**
         * @ngdoc method
         * @name startTimeout
         * @module sil.session
         * @methodOf sil.session.manager
         * @description
         * Starts ng-idle. This should typically be called after a user is
         * logged in.
         */
        self.startTimeout = function startTimeoutFunction () {
            if (authConfig.isLoggedIn()) {
                idle.watch();
                title.restore();
            }
        };

        /**
         * @ngdoc method
         * @name stopTimeout
         * @module sil.session
         * @methodOf sil.session.manager
         * @description
         * Stops ng-idle from from timing out. Typically this is called
         * at the point which a user logs out/ is logged out.
         */
        self.stopTimeout = function stopTimeoutFunction () {
            idle.unwatch();
        };

        /**
         * @ngdoc method
         * @name dumpState
         * @module sil.session
         * @methodOf sil.session.manager
         * @param {String} state The name of the current state the user is in.
         * @param {Object} params $stateParams of the current state.
         *
         * @description
         * Simply dumps the state and the params of the current state that
         * a user is on. The method also takes in the user id. This is so
         * as to prevent other users from accessing the state details of another
         * user who was using the same browser to access the web app.
         */
        self.dumpState = function dumpStateFunction (state, params) {
            var user = authConfig.getUser();
            if (user) {
                var state_dump = {
                    "name": state.name,
                    "params": params,
                    "user": user.id
                };
                storage.setItem(STATE_STORE, state_dump);
            }
        };

        /**
         * @ngdoc method
         * @name loadState
         * @module sil.session
         * @methodOf sil.session.manager
         * @returns {Object} The state and its params.
         *
         * @description
         * Gets the current user to determine if the user has any previous
         * states stored. The `stateName` and `stateParams` are returned
         * otherwise null is returned.
         */
        self.loadState = function loadStateFunction () {
            var user = authConfig.getUser();
            var dump = storage.getItem(STATE_STORE);
            if (user && dump) {
                if (dump.user === user.id) {
                    return {
                        "name": dump.name,
                        "params": dump.params
                    };
                }
            }
            return null;
        };

        /**
         * @ngdoc method
         * @name clearState
         * @module sil.session
         * @methodOf sil.session.manager
         * @returns {Promise} Whether the operation was successful or it failed
         *
         * @description
         * Remove `dumped states` from the localStorage.
         * Typically done after loading a previously stored state since after
         * redirecting a user to that page the stored state is no longer
         * required.
         */
        self.clearState = function clearStateFunction () {
            return storage.removeItem(STATE_STORE);
        };
    }
})(window.angular);

// Source: sil_app_actions.js
(function (angular, _) {
/**
     * @ngdoc overview
     * @name sil.element.actions
     *
     * @requires sil.actions
     * @requires ui.router
     *
     * @description Authorization checks on elements
     */
    angular.module("sil.element.actions", [
        "sil.actions",
        "ui.router"
    ])

    .directive("silAppActions", SilAppActions)
    .directive("silNavAuthz", NavAuthzDirective);

    /**
     * @ngdoc directive
     * @name sil.element.actions:navAuthz
     * @module sil.element.actions
     * @restrict A
     * @priority 999 just below ng-repeat (1000)
     *
     * @requires sil.actions.hasAction
     * @requires $interpolate
     * @requires $state
     *
     * @param {String} [uiSref=""]
     * State to check actions.
     *
     * @param {String} [silNavAuthz=""]
     * If ui-sref is not defined, e.g. in places where ``ui-sref`` is not
     * required, the state should be set here. It's an alternative for
     * ``ui-sref``
     *
     * @description
     * Determine whether a link is visible if the user has at least one
     * permission which is required by the state linked to or any
     * child states of the state.
     * At least one of ``ui-sref`` or the ``sil-nav-authz`` attributes should be
     * set.
     *
     * @throws {Error}
     * An error is thrown when the following scenarios are all true:
     *     - the ``ui-sref`` attribute is not present or it's empty
     *     - the ``sil-nav-authz`` attribute is empty
     *
     */

    NavAuthzDirective.$inject = [
        "$state", "$interpolate", "sil.actions.hasAction"
    ];
    function NavAuthzDirective($state, $interpolate, hasAction) {
        return {
            link: function (scope, el, attrs, controller, transclude) {
                transclude(scope, function transcludeNav(clone) {
                    var stateName = $interpolate(
                        attrs.uiSref || attrs.silNavAuthz
                    )(scope);

                    if (! stateName) {
                        return;
                    }

                    var myActions; // holds actions of the current state

                    // retrieve all my children
                    var childStates = _.filter($state.get(), function(s) {
                        if (s.name === stateName) {
                            myActions = (s.data) ? s.data.actions : undefined;
                        }
                        return s.name.indexOf(stateName+".") === 0 ||
                            (s.parent||"").indexOf(stateName) === 0;
                    });

                    if (myActions) {
                        // if parent state has actions, use them
                        if (hasAction.hasActions(myActions)) {
                            el.after(clone);
                        }
                        return;
                    }

                    var childActions = _.chain(childStates)
                    .map(function(s) {
                        return (s.data) ? s.data.actions : undefined;
                    })
                    .uniq()
                    .value();

                    var compactChildActions = _.compact(childActions);
                    if (compactChildActions.length === childActions.length) {
                        // if all children have actions, do action check
                        if (hasAction.hasActions(childActions.join(";"))) {
                            el.after(clone);
                        }
                    } else  {
                        // if at least one child has no actions, show parent
                        el.after(clone);
                    }
                });
            },
            // one below ng-repeat so that ng-repeat can be able to
            // set values
            priority: 999,
            restrict: "A",
            transclude: "element"
        };
    }

    /**
     * @ngdoc directive
     * @name sil.element.actions:silAppActions
     * @module sil.element.actions
     *
     * @requires sil.actions.hasAction
     * @requires $injector
     *
     * @restrict A
     * @priority 1500 higher than ng-switch (1200)
     *
     * @param {String} [silAppActions=""]
     * Defines the actions required to be able display a particular element
     *
     * @description
     * This directive uses transclusion to perform fine-grained
     * authorization. It determines which elements are to be displayed in a
     * page / view. It does so by allowing elements to be attached to an
     * action with which a user must have the required permissions as determined
     * by the action.
     *
     * ## Use case: Explicitly defined actions
     * ```html
     * <button sil-app-actions='create.patient'></button>
     * ```
     * The directive supports AND and OR actions where a user is required to have
     * all the actions defined or only one respectively
     *
     * ### AND actions
     * ```html
     * <button sil-app-actions='create.patient:create.visit'></button>
     * ```
     * ### OR actions
     * ```html
     * <button sil-app-actions='create.patient;create.visit'></button>
     * ```
     */

    SilAppActions.$inject = ["sil.actions.hasAction", "$interpolate"];
    function SilAppActions (hasAction, $interpolate) {
        return {
            link: function (scope, elem, attrs, ctrl, transclude) {
                transclude(scope, function (clone) {
                    var actions = $interpolate(attrs.silAppActions)(scope);

                    if (hasAction.hasActions(actions)) {
                        elem.after(clone);
                    }
                });
            },
            // Highest yet : higher than ng-switch (1200)
            priority: 1500,
            restrict: "A",
            transclude: "element"
        };
    }
})(window.angular, window._);

// Source: storage.js
(function (angular) {
/**
     * @ngdoc overview
     * @name sil.storage.backend
     *
     * @description Allows storage operations to be performed. The storage
     * backends defined are `sessionStorage` and `localStorage`.
     *
     */
    angular.module("sil.storage.backend", [])

    .service("sil.storage.backend.localstorage", LocalStorage);

    /**
     * @ngdoc service
     * @name sil.storage.backend.localstorage
     * @module sil.storage.backend
     * @requires $window
     *
     * @description
     * CRUD methods for localStorage
     */
    // LocalStorage.$inject = ["$window"];
    LocalStorage.$inject = ["$window"];
    function LocalStorage ($window) {
        var localstorage = $window.localStorage;
        /**
         * @ngdoc method
         * @name getItem
         * @module sil.storage.backend
         * @methodOf sil.storage.backend.localstorage
         * @param {String} key The index to retrieve data from.
         * @return {string|null} The stored stored string. Or null if none is found
         * @description
         * Retrieve an item from local storage
         */
        this.getItem = function(key) {
            return JSON.parse(localstorage.getItem(key));
        };
        /**
         * @ngdoc method
         * @name setItem
         * @module sil.storage.backend
         * @methodOf sil.storage.backend.localstorage
         * @param {String} key. The index to store in
         * @param {String} value. The value to store
         *
         * @description
         * Stores an item in local storage
         */
        this.setItem = function(key, value) {
            localstorage.setItem(key, JSON.stringify(value));
        };
        /**
         * @ngdoc method
         * @name removeItem
         * @module sil.storage.backend
         * @methodOf sil.storage.backend.localstorage
         * @param {String} key. The index of the item to delete.
         *
         * @description
         * Delete a single item from local storage
         */
        this.removeItem = function(key) {
            localstorage.removeItem(key);
        };
        /**
         * @ngdoc method
         * @name clear
         * @module sil.storage.backend
         * @methodOf sil.storage.backend.localstorage
         *
         * @description
         * Deletes everything in local storage
         */
        this.clear = function() {
            localstorage.clear();
        };
    }
})(angular);

})(window, document);
