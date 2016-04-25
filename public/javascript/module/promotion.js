/**
 * Created by yagamai on 16-4-21.
 */
var promotions = angular.module('Promotion', []);

promotions.service('PromotionService', ['$http', function ($http) {
    this.findAll = function (option) {
        return $http.get('/admin/promotions', {
            params: option
        });
    };

    this.findOne = function (id) {
        return $http.get('/admin/promotions/' + id);
    };

    this.update = function (promotion) {
        return $http.put('/admin/promotions/' + promotion.id, promotion);
    };

    this.save = function (promotion) {
        return $http.post('/admin/promotions', promotion);
    };
}]);

promotions.controller('PromotionController', ['$scope', 'PromotionService',
    '$stateParams', '$window',
    function ($scope, PromotionService, $stateParams, $window) {
        $scope.typeShow = $window.localStorage.userName !== 'admin';
        $scope.option = {};
        $scope.currentPage = 1;
        $scope.size = 15;

        function init(option) {
            PromotionService
                .findAll(option)
                .then(function (data) {
                    if (data.data.status === 'success') {
                        $scope.items = data.data.data;
                        $scope.total = data.data.total;
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

        $scope.search = function () {
            var option = {
                page: $scope.currentPage,
                size: $scope.size
            };
            init(option);
        };
    }]);

promotions.controller('PromotionDetailController', [
    '$scope',
    '$stateParams',
    'PromotionService',
    '$q',
    '$window',
    function ($scope, $stateParams, PromotionService, $q,$window) {
        $scope.typeShow = $window.localStorage.userName !== 'admin';
        function init() {
            PromotionService
                .findOne($stateParams.id)
                .then(function (data) {
                    $scope.item = data.data.item;
                });
        }

        init();

        $scope.update = function () {
            PromotionService
                .update($scope.item)
                .then(function () {

                })
                .catch(function () {

                })
        };
    }]);

promotions.controller('PromotionCreateController', [
    '$scope',
    'PromotionService',
    '$window',
    function ($scope, PromotionService) {
        $scope.alerts = [];
        $scope.save = function () {
            if ($scope.item.id) {
                PromotionService
                    .update($scope.item)
                    .then(function (res) {
                        if (res.data.status = 'success') {
                            $scope.alerts.push({
                                type: 'success',
                                msg: '更新成功'
                            });
                            $scope.item.id = res.data.id;
                        }
                        else
                            alert('system error');
                    })
                    .catch(function () {

                    });
            } else {
                PromotionService
                    .save($scope.item)
                    .then(function (res) {
                        if (res.data.status = 'success') {
                            $scope.alerts.push({
                                type: 'success',
                                msg: '添加成功'
                            });
                            $scope.item.id = res.data.id;
                        }
                        else
                            alert('system error');
                    });
            }
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }
]);
