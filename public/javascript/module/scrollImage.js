var scrollImage = angular.module('ScrollImage', []);

scrollImage.service('ScrollImageService', ['$http', function ($http) {
    this.findAll = function () {
        return $http.get('/admin/scrollImages');
    };
    this.update = function (item) {
        return $http.put('/admin/scrollImages/' + item.id, item);
    }
}]);

scrollImage.controller('ScrollController', [
    '$scope',
    '$window',
    'ScrollImageService',
    '$http',
    function ($scope, $window, ScrollImageService, $http) {
        function init() {
            ScrollImageService
                .findAll()
                .then(function (data) {
                    $scope.items = data.data.data;
                })
                .catch(function (err) {

                });
        }

        init();

        $scope.update = function (item) {
            ScrollImageService
                .update(item)
                .then(function (data) {
                    if (data.data.status == 'success') {
                        item.updated_time = new Date();
                    }
                })
                .catch(function (err) {})
        }

        $scope.upload = function (event) {
            var file = event.target.files[0];
            var fd = new FormData();
            var index = event.target.getAttribute('index');

            var reader = new FileReader();

            fd.append('file', file);
            fd.append('id', event.target.getAttribute('id'));

            var img = new Image();

            reader.onload = function () {
                img.src = reader.result;
            }
            reader.readAsDataURL(file);

            img.onload = function () {
                if (file.size / 1000 > 500) {
                    alert('img size not match');
                    return;
                }
                if (img.width < 720 || img.height < 366) {
                    alert('img width height not match')
                    return;
                }
                $http.post('/admin/scrollImages', fd, {
                        withCredentials: true,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity
                    })
                    .success(function (data) {
                        var str = data.substring(data.indexOf('\/') + 1);
                        $scope.items[index].image_url = '/' + str;
                    });
            }
        };
    }
]);
