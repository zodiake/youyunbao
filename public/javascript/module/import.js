var importOrder = angular.module('Import', ['socketModule']);

importOrder.service('importService', ['$http', function ($http) {
    this.fakeSocket = function (path) {
        $http.get('/admin/csv');
    };
}]);

importOrder.controller('ImportController', [
    '$scope',
    'socketio',
    'importService',
    '$http',
    '$window',
    function ($scope, socketio, importService, $http, $window) {
        $scope.fails = [];
        $scope.alerts = [];
        $scope.imported = false;

        socketio.emit('join', {
            room: $window.localStorage.userName
        });

        socketio.on('fail', function (data) {
            $scope.fails.push(data);
        });

        socketio.on('finish', function (data) {
            delete $scope.file;
            $scope.alerts.push({
                type: 'success',
                msg: 'import finish'
            });
        });

        $scope.upload = function (event) {
            var file = event.target.files[0];
            var fd = new FormData();

            var reader = new FileReader();

            fd.append('file', file);

            $http.post('/admin/csv', fd, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                })
                .success(function (data) {
                    $scope.file = data.data;
                    $scope.alerts.push({
                        type: 'success',
                        msg: '上传成功'
                    });
                })
                .error(function (err) {
                    var message = err.message || 'server error';
                    $scope.alerts.push({
                        type: 'danger',
                        msg: message
                    });
                });
        };

        $scope.beginImport = function () {
            if (!$scope.file) {
                $scope.alerts.push({
                    type: 'danger',
                    msg: 'no file uploaded'
                });
                return;
            }
            if ($scope.imported) {
                $scope.alerts.push({
                    type: 'warning',
                    msg: '请上传文件'
                });
                return;
            }
            socketio.emit('begin', {
                file: $scope.file,
                room: $window.localStorage.userName
            });
            $scope.imported = true;
        };

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.clear = function () {
            $scope.fails = [];
        };
    }
]);
