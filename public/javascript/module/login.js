var login = angular.module('Login', []);

//all login service
login.service('LoginService', ['$http', function ($http) {
    this.login = function (user) {
        return $http.post('/users/admin/login', {
            name: user.name,
            password: user.password
        });
    };
}]);

login.service('TabService', ['$http', function ($http) {
    this.findAll = function () {
        return $http.get('/admin/tabData');
    }
}]);

//all login controller
login.controller('LoginController', [
    '$scope',
    'LoginService',
    '$state',
    '$window',
    function ($scope, LoginService, $state, $window) {
        $scope.user = {};
        $scope.login = function () {
            if ($scope.loginForm.$valid) {
                LoginService
                    .login($scope.user)
                    .success(function (data) {
                        if (data.authority == 'ROLE_ADMIN') {
                            $state.go('tabs.consignor');
                        } else if (data.authority == 'ROLE_COMMON') {
                            $state.go('tabs.importOrder');
                        }
                        $window.localStorage.user = data.token;
                        $window.localStorage.userName = $scope.user.name;
                    })
                    .error(function (err) {
                        alert('用户名密码错误');
                    });
            }else{
                $scope.loginForm.submitted=true;
            }
        }
    }
]);
