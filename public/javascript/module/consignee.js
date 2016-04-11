var consignee = angular.module('Consignee', ['filterModel']);

consignee.service('ConsigneeService', ['$http', function ($http) {
    this.findAll = function (option) {
        return $http.get('/admin/consignee', {
            params: option
        });
    };
    this.updateState = function (item) {
        var state = item.activate == 1 ? 0 : 1;
        return $http.put('/admin/user/state', {
            userId: item.id,
            state: state
        });
    };
}]);

consignee.controller('ConsigneeController', ['$scope',
    'ConsigneeService',
    '$modal',
    function ($scope, ConsigneeService, $modal) {

        $scope.option = {};
        $scope.currentPage = 1;
        $scope.size = 15;

        function init(option) {
            ConsigneeService
                .findAll(option)
                .success(function (data) {
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
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });
        };
    }
]);

consignee.controller('ModalInstanceCtrl', [
    '$scope',
    '$modalInstance',
    'item',
    'ConsigneeService',
    function ($scope, $modalInstance, item, ConsigneeService) {
        $scope.item = item;
        $scope.ok = function () {
            ConsigneeService
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
