app.directive('postModal', function () {
    return {
        restrict: 'E',
        scope: {
            info: '='
        },
        templateUrl: 'postModal.html'
    };
});