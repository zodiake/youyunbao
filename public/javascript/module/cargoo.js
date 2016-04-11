var cargoo = angular.module('Cargoo', []);

cargoo.service('CargooService', ['$http', function ($http) {
    this.findAll = function (id) {
        return $http.get('/admin/category');
    };

    this.updateState = function (item) {
        var state = item.activate == 1 ? 0 : 1;
        return $http.put('/admin/category/state', {
            id: item.id,
            state: state
        });
    };

    this.update = function (item) {
        return $http.put('/admin/category/' + item.id, item);
    };

    this.save = function (item) {
        return $http.post('/admin/category', item);
    };

    this.findOne = function (id) {
        return $http.get('/admin/category/' + id);
    };
}]);

cargoo.controller('CargooController', [
    '$scope',
    'CargooService',
    '$modal',
    function ($scope, cargooService, $modal) {
        cargooService
            .findAll()
            .then(function (data) {
                $scope.fuel = data.data.data['1'];
                $scope.oil = data.data.data['2'];
                $scope.chemistry = data.data.data['3'];
                $scope.others = data.data.data['4'];
            });

        $scope.changeState = function (item) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalContent.html',
                controller: 'CargooInstanceCtrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });
        };
    }
]);

cargoo.controller('CargooDetailController', [
    '$scope',
    '$stateParams',
    'CargooService',
    '$timeout',
    function ($scope, $stateParams, CargooService, $timeout) {
        $scope.alerts = [];

        function init() {
            CargooService
                .findOne($stateParams.id)
                .success(function (data) {
                    $scope.item = {
                        category: data.data.parent_id + '',
                        name: data.data.name,
                        id: data.data.id
                    };
                })
                .error(function (err) {

                });
        }

        init();

        $scope.submit = function () {
            if ($scope.cargooForm.$valid) {
                CargooService
                    .update($scope.item)
                    .success(function (data) {
                        $scope.alerts.push({
                            type: 'success',
                            msg: '更新成功'
                        });
                    })
                    .error(function (err) {
                        $scope.alerts.push({
                            type: 'danger',
                            msg: '服务器错误'
                        });
                    });
            } else {
                $scope.alerts.push({
                    type: 'danger',
                    msg: '提交信息有错'
                })
            }
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }
]);

cargoo.controller('CargooAddController', [
    '$scope',
    'CargooService',
    '$timeout',
    function ($scope, CargooService, $timeout) {
        $scope.item = {};
        $scope.alerts = [];

        $scope.submit = function () {
            CargooService
                .save($scope.item)
                .success(function (data) {
                    $scope.alerts.push({
                        type: 'success',
                        msg: '添加成功'
                    });
                })
                .error(function (err) {
                    $scope.alerts.push({
                        type: 'fail',
                        msg: '添加失败'
                    });
                });
        };
    }
]);

cargoo.controller('CargooInstanceCtrl', [
    '$scope',
    '$modalInstance',
    'item',
    'CargooService',
    function ($scope, $modalInstance, item, CargooService) {
        $scope.item = item;
        $scope.ok = function () {
            CargooService
                .updateState(item)
                .success(function (data) {
                    if (data.status == 'success') {
                        item.activate = item.activate == 1 ? 0 : 1;
                    }
                    $modalInstance.close();
                })
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        }
    }
])
