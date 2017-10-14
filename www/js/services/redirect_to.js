angular.module('app.services.redirectTo', [])

.service('app.services.redirectTo', RedirectTo);
    RedirectTo.$inject = [
        '$rootScope', '$state',
    ];
    function RedirectTo($rootScope, $state) {
        var self = this;

        function stateListener(event, toState) {
            if (toState.redirectTo) {
                var goTo = toState.redirectTo;
                /* if (_.isArray(goTo)) {
                    goTo = redirectState.determineRedirectState(goTo);
                }*/
                $state.go(goTo);
            }
            event.preventDefault();
        }
        self.redirectTo = function redirectTo() {
            $rootScope.$on('$stateChangeSuccess', stateListener);
        };
    };
