angular.module('starter.routes', [])
.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
  $stateProvider

    .state('app', {
    url: '/app?id&refresh&biz_name',
    cache: false,
    abstract: true,
    views: {
          "content": {
              templateUrl: 'templates/menu.html',
              controller: 'app.controllers.homeController'
          }
      }
  })

  .state("login", {
      url: "/login",
      views: {
          "content": {
              templateUrl: "templates/login.html",
              controller: "providerPortal.auth.controllers.loginAuth"
          }
      }
  })

  .state('app.dashboard', {
      cache: false,
      url: '/dashboard',
      views: {
        'menuContent@app': {
          templateUrl: 'templates/home.html',
          controller: 'app.controllers.aBusinessController'
        }
      }
  })

  .state('app.home', {
      cache: false,
      url: '/home',
      views: {
        'menuContent@app': {
          templateUrl: 'templates/home_screen.html',
          controller: 'app.controllers.homeController'
        }
      }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('app.home');
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
})
