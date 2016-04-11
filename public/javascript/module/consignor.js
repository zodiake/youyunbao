var consignor = angular.module('Consignor', []);

consignor.service('ConsignorService', ['$http', function ($http) {
    this.findAll = function (option) {
        return $http.get('/admin/consignor', {
            params: option
        });
    }
    this.updateState = function (item) {
        var state = item.activate == 1 ? 0 : 1;
        return $http.put('/admin/user/state', {
            userId: item.id,
            state: state
        });
    };
}]);

consignor.controller('ConsignorController', ['$scope',
    'ConsignorService',
    '$modal',
    function ($scope, ConsignorService, $modal) {
        $scope.option = {};
        $scope.currentPage = 1;
        $scope.size = 15;

        function init(option) {
            ConsignorService
                .findAll(option)
                .success(function (data) {
                    console.log(data);
                    if (data.status == 'success') {
                        $scope.items = data.data.data;
                        $scope.total = data.data.total;
                    } else {

                    }
                })
                .error(function (err) {

                });
        }

        init();

        $scope.search = function () {
            init({
                page: $scope.currentPage,
                size: $scope.size,
                mobile: $scope.option.mobile,
                activate: $scope.option.activate
            });
        };
        $scope.changeState = function (item) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'ConsignorModal.html',
                controller: 'ConsignorModalCtrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });
        };
    }
]);
consignor.controller('ConsignorModalCtrl', [
    '$scope',
    '$modalInstance',
    'item',
    'ConsignorService',
    function ($scope, $modalInstance, item, ConsignorService) {
        $scope.item = item;
        $scope.ok = function () {
            ConsignorService
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
