var question = angular.module('Question', []);

question.service('QuestionService', ['$http', function ($http) {
    this.findAll = function (opts) {
        $http.get('/admin/questions', {
            params: opts
        });
    }
}]);
