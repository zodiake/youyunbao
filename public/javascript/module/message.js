var message = angular.module('Message', []);

message.service('MessageService', ['$http', function ($http) {
    this.push = function (message) {
        return $http.post('/admin/jpush', {
            type: message.type,
            content: message.content
        });
    };
}]);

message.controller('MessageController', ['$scope', 'MessageService', function ($scope, MessageService) {
    $scope.message = {};

    $scope.submit = function () {
        MessageService
            .push($scope.message)
            .then(function (data) {
                if (data.data.status == 'success')
                    alert('发送成功');
                else
                    alert('发送失败');
            });
    };
}]);
