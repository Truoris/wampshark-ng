'use strict';

angular.module('ws.login', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'modules/login/login.html',
            controller: 'LoginCtrl'
        }).when('/logout', {
            templateUrl: 'modules/login/logout.html',
            controller: 'LogoutCtrl'
        });
    }])

    .controller('LoginCtrl', ['$rootScope', '$scope', '$location', 'Notification', '$wamp',
        function($rootScope, $scope, $location, $notif, $wamp) {
            if ($wamp.isAuthenticated()) {
                $location.path("/");
                return;
            }

            $scope.getFromStorage = function (storage, key, default_value) {
                let value = storage.getItem(key);
                if (value === null) {
                    storage.setItem(key, default_value);
                    value = default_value;
                }
                return JSON.parse(value);
            }

            $scope.addToStorage = function (storage, key, values, value) {
                if (values.indexOf(value) === -1) {
                    values.push(value)
                }
                storage.setItem(key, JSON.stringify(values));
            }

            $scope.url_history = $scope.getFromStorage(localStorage,"url_history", "[]");
            $scope.realm_history = $scope.getFromStorage(localStorage,"realm_history", "[]");

            $scope.connect = {
                auth_type: 'Anonymous'
            };

            $scope.login = function () {
                $wamp.connect($scope.connect).then(function (res) {
                    $scope.addToStorage(localStorage,"url_history", $scope.url_history, $scope.connect.url);
                    $scope.addToStorage(localStorage,"realm_history", $scope.realm_history, $scope.connect.realm);

                    sessionStorage.setItem("auth_options", JSON.stringify($scope.connect));

                    $location.path("/");
                }, function (error) {});
            };


        }]).controller('LogoutCtrl', ['$location', '$wamp',
    function($location, $wamp) {
        sessionStorage.removeItem("auth_options");
        if ($wamp.isAuthenticated())
            $wamp.close();
        $location.path("/login");
    }]);