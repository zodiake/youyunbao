/**
 * Created by yagamai on 15-12-21.
 */

var password = angular.module('Password', []);

password.service('PasswordService', ['$http', function ($http) {
    this.update = function (password) {
        return $http.put('/admin/password', {password: password});
    };
}]);

password.controller('PasswordController', ['$scope', 'PasswordService', function ($scope, passwordService) {
    $scope.option = {};

    $scope.submit = function () {
        if ($scope.option.password1 !== $scope.option.password2) {
            alert('密码不一致');
            return;
        }
        passwordService
            .update($scope.option.password1)
            .then(function (data) {
                console.log(data);
                if (data.data.status === 'success')
                    alert('修改成功');
            })
            .catch(function (err) {

            });
    };
}]);
