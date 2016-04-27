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

    this.frozen = function (id) {
        return $http.put('/admin/promotions/valid/' + id);
    }
}]);

promotions.controller('PromotionController', ['$scope', 'PromotionService',
    '$stateParams', '$window', '$modal',
    function ($scope, PromotionService, $stateParams, $window, $modal) {
        $scope.typeShow = $window.localStorage.userName !== 'admin';
        $scope.option = {};
        $scope.currentPage = 1;
        $scope.size = 15;
        $scope.usr = $window.localStorage.userName;

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

        $scope.frozen = function (item) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modal.html',
                controller: 'PromotionModalCtrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });
        };
    }]);

promotions.controller('PromotionModalCtrl', ['item', 'PromotionService', '$scope', '$modalInstance',
    function (item, PromotionService, $scope, $modalInstance) {
        $scope.item = item;
       
        $scope.ok = function () {
            PromotionService
                .frozen(item.id)
                .then(function () {
                    $modalInstance.dismiss();
                    item.valid = item.valid == 1 ? 0 : 1;
                })
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);

promotions.controller('PromotionDetailController', [
    '$scope',
    '$stateParams',
    'PromotionService',
    '$q',
    '$window',
    function ($scope, $stateParams, PromotionService, $q, $window) {
        $scope.typeShow = $window.localStorage.userName !== 'admin';
        $scope.alerts = [];
        function init() {
            PromotionService
                .findOne($stateParams.id)
                .then(function (data) {
                    $scope.item = data.data.item;
                })
                .catch(function () {

                });
        }

        init();

        $scope.update = function () {
            if ($scope.orderForm.$valid) {
                PromotionService
                    .update($scope.item)
                    .then(function (res) {
                        if (res.data.status = 'success') {
                            $scope.alerts.push({
                                type: 'success',
                                msg: '更新成功'
                            });
                        } else
                            alert('system error');
                    })
                    .catch(function () {

                    })
            }
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }]);

promotions.controller('PromotionCreateController', [
    '$scope',
    'PromotionService',
    '$window',
    function ($scope, PromotionService) {
        $scope.alerts = [];
        $scope.item = {};
        $scope.save = function () {
            if ($scope.orderForm.$valid) {
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
                                $scope.item.promotion_code = res.data.code;
                            }
                            else
                                alert('system error');
                        });
                }
            }
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }
]);
