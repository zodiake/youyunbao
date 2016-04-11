var order = angular.module('Order', []);

order.service('OrderService', ['$http', function ($http) {
    this.findAll = function (option) {
        return $http.get('/admin/orders', {
            params: option
        });
    };
    this.findByOrderId = function (orderId) {
        return $http.get('/admin/orders/' + orderId);
    };
    this.update = function (item) {
        return $http.put('/admin/orders/' + item.id, item);
    };
    this.export = function (option) {
        return $http.get('/admin/orders/export', {
            params: option
        });
    };
}]);

order.service('CategoryService', ['$http', function ($http) {
    this.findByParent = function (parentId) {
        return $http.get('/category?id=' + parentId, {
            cache: true
        });
    };
    this.findFirst = function () {
        return $http.get('/category', {
            cache: true
        });
    };
}]);

order.service('OrderGisService', ['$http', function ($http) {
    this.findByOrderId = function (id) {
        return $http.get('/orders/' + id + '/geo');
    };
}]);

order.controller('OrderController', ['$scope', 'OrderService',
    '$stateParams', '$window',
    function ($scope, OrderService, $stateParams, $window) {
        $scope.typeShow = $window.localStorage.userName === 'admin';
        $scope.size = 15;
        $scope.canDownload = false;

        $scope.option = {};

        function init(option) {
            OrderService
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

        if ($window.localStorage.orderList) {
            var opt = JSON.parse($window.localStorage.orderList);
            $scope.option = opt;
            if (opt.beginTime) {
                $scope.option.beginTime = new Date(opt.beginTime);
            }
            $scope.currentPage = opt.page || 1;
            if (opt.endTime) {
                $scope.option.endTime = new Date(opt.endTime);
            }
            init(opt);
        } else {
            init();
        }

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
            var option = {
                page: $scope.currentPage,
                size: $scope.size,
                state: $scope.option.state,
                beginTime: beginTime,
                endTime: endTime,
                orderNumber: $scope.option.orderNumber,
                consignor: $scope.option.consignor,
                batch: $scope.option.batch,
                type: $scope.option.type
            };
            $window.localStorage.orderList = JSON.stringify(option);
            init(option);
        };

        $scope.export = function () {
            OrderService.export($scope.option);
        };

    }
]);

order.controller('OrderDetailController', [
    '$scope',
    '$stateParams',
    'OrderService',
    'CategoryService',
    '$q',
    function ($scope, $stateParams, OrderService, CategoryService, $q) {
        function init() {
            var array = [
                OrderService.findByOrderId($stateParams.id),
                CategoryService.findFirst()
            ];
            $q.all(array)
                .then(function (data) {
                    $scope.item = data[0].data.data;
                    $scope.categories = data[1].data.data;
                    return CategoryService.findByParent($scope.item.category)
                })
                .then(function (data) {
                    $scope.cargooNames = data.data.data;
                });
        }

        init();

        $scope.changeState = function (category) {
            CategoryService
                .findByParent(category)
                .then(function (data) {
                    $scope.cargooNames = data.data.data;
                });
        };

        $scope.update = function () {
            if (!$scope.orderForm.$valid) {
                return;
            }
            OrderService
                .update($scope.item)
                .then(function (data) {

                })
                .catch(function (err) {

                });
        };

        $scope.close = function () {
            OrderService
                .updateState($scope.item)
                .then(function () {

                })
                .catch(function (err) {

                });
        };
    }
]);

order.controller('OrderMapController', [
    '$scope',
    '$stateParams',
    'OrderGisService',
    function ($scope, $stateParams, OrderGisService) {
        $scope.mapOptions = {
            zoom: 15,
            markers: [],
            center: {}
        };
        OrderGisService
            .findByOrderId($stateParams.id)
            .then(function (data) {
                if (data.data.data.length > 0) {
                    $scope.mapOptions.markers = data.data.data;
                    $scope.mapOptions.center = data.data.data[0];
                } else {
                    alert('没有地理位置信息');
                    $scope.mapOptions.markers = [];
                    $scope.mapOptions.center = {
                        longitude: 116.404,
                        latitude: 39.915
                    };
                }
            })
    }
]);
