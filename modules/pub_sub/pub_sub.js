'use strict';

angular.module('ws.pubsub', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/pub-sub', {
            templateUrl: 'modules/pub_sub/pub_sub.html',
            controller: 'PubSubCtrl'
        });
    }])

    .controller('PubSubCtrl', ['$scope', '$location', '$uibModal', '$global', 'Notification', '$wamp',
        function($scope, $location, $uibModal, $global, $notif, $wamp) {
            if (!$wamp.isAuthenticated()) {
                console.log('not authenticated');
                $location.path("/login");
                return;
            }

            $global.page.set('pubsub');
        }]);
