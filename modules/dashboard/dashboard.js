'use strict';

angular.module('ws.dashboard', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'modules/dashboard/dashboard.html',
            controller: 'DashboardCtrl'
        });
    }])

    .controller('DashboardCtrl', ['$scope', '$location', '$uibModal', '$global', 'Notification', '$wamp',
        function($scope, $location, $uibModal, $global, $notif, $wamp) {
            if (!$wamp.isAuthenticated()) {
                console.log('not authenticated');
                $location.path("/login");
                return;
            }

            $global.page.set('dashboard');
        }]);
