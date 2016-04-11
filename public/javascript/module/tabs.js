var tabs = angular.module('Tabs', []);

tabs.controller('ImportTabsController', ['$scope', function ($scope) {
    $scope.tabDate = [{
        heading: '运单import',
        route: 'tabs.importOrder',
    }];
}]);

tabs.controller('TabsController', ['$scope', 'tabData', function ($scope, tabData) {
    $scope.tabData = tabData.data;
}]);
