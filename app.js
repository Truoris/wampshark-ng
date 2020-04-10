'use strict';

function getRandomColor() {
    var color = 'rgba(';
    for (var i = 0; i < 3; i++) {
        color += Math.floor(Math.random() * 256);

        if (i < 2) {
            color += ", ";
        }
    }
    return color+", 0.4)";
}

angular.module('ws', [
    'ngRoute',
    'ui.bootstrap',
    'ui-notification',
    'ui.bootstrap.contextMenu',
    'angularEnter',
    'jsonFormatter',
    'ws.services.global',
    'ws.services.wamp',
    'ws.login',
    'ws.dashboard',
    'ws.pubsub'
])
    .config(['$routeProvider', '$httpProvider', 'NotificationProvider', '$locationProvider', function ($routeProvider, $httpProvider, $NotificationProvider, $locationProvider) {
        $routeProvider.otherwise({
            redirectTo: '/'
        });

        $locationProvider.hashPrefix('');

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $NotificationProvider.setOptions({
            delay: 10000,
            startTop: 20,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'right',
            positionY: 'top'
        });
    }])
    .controller('GlobalCtrl', ['$scope', '$global', '$location', '$wamp',
        function ($scope, $global, $location, $wamp) {
            $scope.global = $global;
            $scope.wamp = $wamp;
            $scope.app_ready = false;

            $scope.$watch('app_ready', function () {
                if ($scope.app_ready)
                    $scope.ready();
            });

            $scope.ready = function() {
                $scope.wamp = $wamp;

                $global.update.subscribe(function () {
                    $scope.global = $global;
                });
            };

            let auth_options = sessionStorage.getItem("auth_options");
            if (auth_options !== null) {
                $wamp.connect(JSON.parse(auth_options)).then(function (res) {
                    $scope.app_ready = true;

                    if ($location.path() === "/login")
                        $location.path("/");
                }, function (error) {
                    $scope.app_ready = true;
                    $location.path("/login");
                });
            } else {
                $scope.app_ready = true;
            }
     }]);
