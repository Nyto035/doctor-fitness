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
              controller: 'app.controllers.aBusinessController'
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

  .state("businesses", {
      cache: false,
      url: "/business",
      redirectTo: 'businesses.list',
      views: {
          "content": {
              templateUrl: "templates/businesses.html",
              controller: "app.controllers.businessController"
          }
      }
  })
  .state("businesses.list", {
      cache: false,
      url: '/list',
      views: {
        'menuContent@businesses': {
            templateUrl: 'templates/business_lists.html',
            controller: "app.controllers.businessController"
        }
      }
  })
  .state("businesses.list.new_business", {
      cache: false,
      url: '/new_business',
      views: {
        'menuContent@businesses': {
            templateUrl: 'templates/add_business.html',
            controller: "app.controllers.businessController"
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
          controller: 'app.controllers.businessHomeController'
        }
      }
  })

  .state('app.sales', {
      cache: false,
      url: '/sales?sales_id&is_open',
      /*params: {
          is_open: null,
      },*/
      views: {
          'menuContent': {
            templateUrl: 'templates/sales.html',
            controller: 'app.controllers.aBusinessController'
          }
      }
  })

  .state('app.sales.create', {
      cache: false,
      url: '/new',
      views: {
          'new_sale@app.sales': {
              templateUrl: 'templates/new_sale.html'
          }
      }
  })

  .state('app.purchases', {
      cache: false,
      url: '/purchases?purchase_id&is_open',
      views: {
          'menuContent': {
            templateUrl: 'templates/purchases.html',
            controller: 'app.controllers.purchasesController'
          }
      }
  })

  .state('app.expenses', {
      cache: false,
      url: '/expenses?expense_id&is_open',
      views: {
          'menuContent': {
            templateUrl: 'templates/expenses.html',
            controller: 'app.controllers.businessExpensesController'
          }
      }
  })

  .state('app.business_information', {
      cache: false,
      url: '/business_information',
      views: {
          'menuContent': {
            templateUrl: 'templates/business_information/main.html',
            controller: 'app.controllers.businessInformationController'
          }
      }
  })

  .state('app.contact', {
      url: '/contact',
      views: {
        'menuContent': {
          templateUrl: 'templates/contact.html'
        }
      }
    })
.state('signup', {
      url: '/signup?email&msg',
      views: {
          "content": {
              templateUrl: "templates/signup.html",
              controller: "providerPortal.auth.controllers.signUp"
          }
      }
    })
  .state('app.pricing', {
    url: '/pricing',
    views: {
      'menuContent': {
        templateUrl: 'templates/pricing.html',

      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
})
