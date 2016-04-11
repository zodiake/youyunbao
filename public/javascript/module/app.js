var app = angular.module('app', [
    'angular-jwt',
    'ui.router',
    'ui.bootstrap',
    'ui.router.tabs',
    'Tabs',
    'Login',
    'Consignor',
    'Order',
    'ScrollImage',
    'Cargoo',
    'Consignee',
    'Recommand',
    'User',
    'OrderReport',
    'Message',
    'Import',
    'baiduMap',
    'ngFileUpload',
    'socketModule',
    'upload',
    'Question',
    'Password'
]);

app.config(['$stateProvider',
    '$urlRouterProvider',
    'jwtInterceptorProvider',
    '$httpProvider',
    function ($stateProvider, $urlRouterProvider, jwtInterceptorProvider, $httpProvider) {
        jwtInterceptorProvider.tokenGetter = ['$window', function ($window) {
            return window.localStorage.user;
        }];

        $httpProvider.interceptors.push('jwtInterceptor');

        $urlRouterProvider.otherwise("/login");

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'LoginController'
            })
            .state('managerTabs', {
                url: '/managerTabs',
                templateUrl: '/admin/tabs.html',
                abstract: true,
                controller: 'ImportTabsController'
            })
            .state('managerTabs.import', {
                url: '/import',
                templateUrl: '/admin/import.html',
                controller: 'ImportController'
            })
            .state('tabs', {
                url: '/tabs',
                templateUrl: '/admin/tabs.html',
                abstract: true,
                resolve: {
                    tabData: ['TabService', '$q', function (TabService, $q) {
                        return TabService.findAll();
                    }]
                },
                controller: 'TabsController'
            })
            .state('tabs.consignor', {
                url: '/consignor',
                templateUrl: '/admin/consignor.html',
                controller: 'ConsignorController'
            })
            .state('tabs.order', {
                url: '/order?id=1',
                templateUrl: '/admin/order.html',
                controller: 'OrderController'
            })
            .state('tabs.orderDetail', {
                url: '/order/:id',
                templateUrl: '/admin/orderDetail.html',
                controller: 'OrderDetailController'
            })
            .state('tabs.orderMap', {
                url: '/order/:id/map',
                templateUrl: '/admin/map.html',
                controller: 'OrderMapController'
            })
            .state('tabs.importOrder', {
                url: '/import',
                templateUrl: '/admin/import.html',
                controller: 'ImportController'
            })
            .state('tabs.scrollImage', {
                url: '/scrollImage',
                templateUrl: '/admin/scrollImage.html',
                controller: 'ScrollController'
            })
            .state('tabs.cargoo', {
                url: '/cargoo',
                templateUrl: '/admin/cargoo.html',
                controller: 'CargooController'
            })
            .state('tabs.cargooAdd', {
                url: '/cargooAdd',
                templateUrl: '/admin/cargooAdd.html',
                controller: 'CargooAddController'
            })
            .state('tabs.cargooDetail', {
                url: '/cargooDetail/:id',
                templateUrl: '/admin/cargooDetail.html',
                controller: 'CargooDetailController'
            })
            .state('tabs.consignee', {
                url: '/consignee',
                templateUrl: '/admin/consignee.html',
                controller: 'ConsigneeController'
            })
            .state('tabs.recommand', {
                url: '/recommand',
                templateUrl: '/admin/recommand.html',
                controller: 'RecommandController'
            })
            .state('tabs.user', {
                url: '/user',
                templateUrl: '/admin/user.html',
                controller: 'UserController'
            })
            .state('tabs.orderReport', {
                url: '/orderReport',
                templateUrl: '/admin/orderReport.html',
                controller: 'OrderReportController'
            })
            .state('tabs.message', {
                url: '/message',
                templateUrl: '/admin/message.html',
                controller: 'MessageController'
            })
            .state('tabs.scrollImageAdd', {
                url: '/scrollImageAdd',
                templateUrl: '/admin/scrollImageAdd.html',
                controller: 'ScrollImageAddController'
            })
            .state('tabs.recommandDetail', {
                url: '/recommand/:id',
                templateUrl: '/admin/recommandDetail.html',
                controller: 'RecommandDetailController'
            })
            .state('tabs.questions', {
                url: '/questions',
                templateUrl: '/admin/questions.html',
                controller: 'QuestionController'
            })
            .state('tabs.password', {
                url: '/password',
                templateUrl: '/admin/password.html',
                controller: 'PasswordController'
            });
    }
]);