'use strict';

angular.module('ws.rpc', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/rpc', {
            templateUrl: 'modules/rpc/rpc.html',
            controller: 'RPCCtrl'
        });
    }])

    .controller('RPCCtrl', ['$scope', '$location', '$uibModal', '$global', 'Notification', '$wamp',
        function($scope, $location, $uibModal, $global, $notif, $wamp) {
            if (!$wamp.isAuthenticated()) {
                $location.path("/login");
                return;
            }

            $global.page.set('rpc');
            $scope.call = {
                uri: "",
                params: "[]",
                duration: 0,
                success: false,
                error: false
            };

            $scope.get_rpcs = function () {
                $scope.rpcs = [];

                $wamp.call("wamp.registration.list", [], function (rpcs) {
                    rpcs.exact.forEach(function(rpc_id) {
                        $wamp.call("wamp.registration.get", [rpc_id], function (rpc) {
                            $scope.rpcs.push(rpc);
                        });
                    });
                });
            };
            $scope.get_rpcs();

            $scope.prepare_call = function (uri) {
                $scope.call = {
                    uri: uri,
                    params: "[]",
                    success: false,
                    error: false,
                    duration: 0
                };
            };

            $scope.rpc_call = function () {
                $scope.call.success = false;
                $scope.call.error = false;
                $scope.call.result = "...";

                let params = [];
                try {
                    params = JSON.parse($scope.call.params);
                } catch (error) {
                    $scope.call.error = true;
                    $scope.call.result = error;
                    return;
                }

                let start = Date.now();
                $wamp.call($scope.call.uri, params, function (rpc) {
                    $scope.call.duration = Date.now()-start;
                    $scope.call.success = true;
                    if (rpc === null)
                        $scope.call.result = "null";
                    else
                        $scope.call.result = JSON.stringify(rpc, null, 4);
                }, function (error) {
                    $scope.call.duration = Date.now()-start;
                    $scope.call.error = true;
                    $scope.call.result = JSON.stringify(error, null, 4);
                });
            };
        }]);