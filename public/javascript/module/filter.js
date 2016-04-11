var filterModel = angular.module('filterModel', []);

filterModel.filter('genderFilter', function () {
    return function (gender) {
        if (!gender)
            return '无';
        return gender == 'f' ? '女' : '男';
    };
});

filterModel.filter('companyNameFilter', function () {
    return function (name) {
        if (!name)
            return '无';
        return name;
    };
});

filterModel.filter('readStateFilter', function () {
    return function (name) {
        return name == 1 ? '已读' : '未读';
    };
});

filterModel.filter('activateFilter', function () {
    return function (state) {
        return state == '1' ? '使用中' : '冻结';
    };
});

filterModel.filter('stateButtonFilter', function () {
    return function (state) {
        return state == '1' ? '冻结' : '解冻';
    };
});
