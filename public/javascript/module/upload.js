var upload = angular.module('upload', []);

upload.directive('fileUpload', function () {
    // Runs during compile
    return {
        restrict: 'A',
        link: function ($scope, element, attrs, controller) {
            var onChangeHandler = $scope.$eval(attrs.fileUpload);
            element.bind('change', onChangeHandler);
        }
    };
});
