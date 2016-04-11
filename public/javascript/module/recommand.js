/*global angular */
'use strict';
var recommand = angular.module('Recommand', []);

recommand.service('RecommandService', ['$http', function ($http) {
    this.findByOption = function (option) {
        return $http.get('/admin/suggestion', {
            params: option
        });
    };

    this.findOne = function (id) {
        return $http.get('/admin/suggestion/' + id);
    };
}]);

recommand.controller('RecommandController', [
    '$scope',
    'RecommandService',
    function ($scope, RecommandService) {
        $scope.option = {};

        $scope.currentPage = 1;
        $scope.size = 15;

        function init(option) {
            RecommandService
                .findByOption(option)
                .then(function (data) {
                    if (data.data.status === 'success') {
                        $scope.items = data.data.data.data;
                        $scope.total = data.data.data.total;
                    } else {

                    }
                })
                .catch(function (err) {

                });
        }

        init();

        $scope.search = function () {
            var begin = $scope.option.beginTime;
            $scope.canDownload = true;
            if (begin) {
                var beginTime = $scope.beginTime = begin.getFullYear() + '-' + (begin.getMonth() + 1) + '-' + begin.getDate();
            }
            var end = $scope.option.endTime;
            if (end) {
                var endTime = $scope.endTime = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();
            }
            init({
                page: $scope.currentPage,
                size: $scope.size,
                state: $scope.option.state,
                beginTime: beginTime,
                endTime: endTime
            });
        };
}]);

recommand.controller('RecommandDetailController', ['$scope',
    'RecommandService',
    '$stateParams',
    function ($scope, RecommandService, $stateParams) {
        $scope.item = {};

        function init() {
            RecommandService
                .findOne($stateParams.id)
                .success(function (data) {
                    $scope.item = data.data;
                })
                .error(function (err) {
                    alert('error');
                });
        }

        init();
    }
]);
