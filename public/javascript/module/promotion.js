/**
 * Created by yagamai on 16-4-21.
 */
var tabs = angular.module('Promotion', []);

tabs.service('PromotionService', [$http, function ($http) {
    this.findAll = function (option) {
        return $http.get('/admin/promotions', {
            params: option
        });
    };
}]);

tabs.controller('PromotionController', ['$scope', 'PromotionService',
    '$stateParams', '$window',
    function ($scope, PromotionService, $stateParams, $window) {
        $scope.option = {};

        function init(option) {
            PromotionService
                .findAll(option)
                .then(function (data) {
                    if (data.data.status === 'success') {
                        $scope.items = data.data.data.data;
                        $scope.total = data.data.data.total;
                    } else {
                        alert('system error');
                    }
                }).catch(function (err) {
            });
        }

        var option = {
            page: $scope.currentPage,
            size: $scope.size
        };

        init(option);
    }]);
