var orderReport = angular.module('OrderReport', []);

orderReport.service('OrderReportService', ['$http', function ($http) {
    this.finAll = function () {
        return $http.get('/admin/aggregate/orders')
    };
}]);

orderReport.controller('OrderReportController', [
    '$scope',
    'OrderReportService',
    function ($scope, OrderReportService) {
        function init() {
            OrderReportService
                .finAll()
                .success(function (data) {
                    $scope.item = data;
                })
                .error(function (err) {

                });
        }

        init();
    }
]);
