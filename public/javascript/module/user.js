var user = angular.module('User', []);

user.service('UserService', ['$http', function ($http) {
    this.findAll = function () {
        return $http.get('/admin/aggregate/users');
    }
}]);

user.controller('UserController', [
    '$scope',
    'UserService',
    function ($scope, UserService) {
        function init() {
            UserService
                .findAll()
                .success(function (data) {
                    $scope.item = data;
                })
                .error(function (err) {

                });
        }

        init();
    }
]);
