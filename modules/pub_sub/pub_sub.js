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

            $scope.topics = {};
            $scope.messages = [];
            $scope.subscription = null;
            $scope.topic_filter = {
                timeout: 5,
                prefix: 'net',
                search: ''
            };

            $scope.get_timeout_time = function() {
                // console.log(Math.floor(new Date().getTime())-($scope.topic_filter.timeout*60000));
                return Math.floor(new Date().getTime())-($scope.topic_filter.timeout*60000);
            }

            $scope.start_listening = function() {
                $scope.topics = {};

                if ($scope.subscription !== null)
                    $wamp.unsubscribe($scope.subscription);

                $wamp.subscribe($scope.topic_filter.prefix, function (args, kwargs, details) {
                    if ($scope.topics[details.topic] !== undefined) {
                        $scope.topics[details.topic].last_update = Math.floor(new Date().getTime());

                        if($scope.topics[details.topic].subscribe)
                            $scope.messages.push({
                                topic: details.topic,
                                publisher_authid: details.publisher_authid,
                                publisher_authrole: details.publisher_authrole,
                                message: args,
                                received_time: Math.floor(new Date().getTime()),
                                color: $scope.topics[details.topic].color
                            });
                    } else {
                        $scope.topics[details.topic] = {
                            topic: details.topic,
                            last_update: Math.floor(new Date().getTime()),
                            subscribe: false,
                            color: getRandomColor()
                        };
                    }
                }, {match: 'prefix'}).then(function (subscription) {
                    $scope.subscription = subscription;
                });
            };
            $scope.start_listening();

            $scope.showMessage = function (message) {
                $uibModal.open({
                    templateUrl: 'modules/pub_sub/message-details.html',
                    controller: 'MessageDetailsCtrl',
                    size: 'lg',
                    resolve: {
                        message: function () {
                            return message;
                        }
                    }
                });
            };

            $scope.apply_md5 = function () {
                if ($scope.topic_filter.search.startsWith('md5(')) {
                    let data = $scope.topic_filter.search.split('(')[1].split(')')[1];
                    if (data !== undefined) {
                        $scope.topic_filter.search = MD5(data);
                    }
                }
            };

            $scope.search = function (topic) {
                return ($scope.topic_filter.search === '' ||
                    topic.topic.toLowerCase().includes($scope.topic_filter.search.toLowerCase()));
            };
        }])



    .controller('MessageDetailsCtrl', ['$scope', 'message', '$uibModalInstance',
        function($scope, message, $uibModalInstance) {
            $scope.message = message;

            $scope.close = function () {
                $uibModalInstance.dismiss();
            }
        }])


    .filter('json_str', [function () {
        return function (input) {
            return JSON.stringify(input);
        }
    }]);