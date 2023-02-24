let wamp_module = angular.module('ws.services.wamp', []);

wamp_module.factory('$wamp', ['Notification', '$q', '$rootScope', function($notif, $q, $rootScope) {
    let obj = {
        data: {
            authenticated: false
        },
        connection: null,
        session: null,
        isAuthenticated: function () {
            return obj.data.authenticated && obj.connection!==null && obj.connection.isConnected;
        },
        connect: function (options) {
            let wamp_options = {url: options.url, realm: options.realm}
            if (options.auth_type === 'WAMP-CRA') {
                wamp_options['authmethods'] = ['wampcra'];
                wamp_options['authid'] = options.auth.username;
                wamp_options['onchallenge'] = function (session, method, extra) {
                    if (method === "wampcra") {
                        return autobahn.auth_cra.sign(options.auth.password, extra.challenge);
                    }
                }
            }
            return $q(function(resolve, reject) {
                obj.connection = new autobahn.Connection(wamp_options);

                obj.connection.onopen = function (session) {
                    console.log("WAMP Session opened");
                    obj.session = session;
                    obj.data.authenticated = true;

                    resolve();
                }
                obj.connection.onclose = function (reason, details) {
                    console.log(reason, details)
                    if (details.message !== null && details.message !=="")
                        $notif.error(details.message);
                    reject(details);
                }

                obj.connection.open();
            });
        },
        close: function () {
            obj.data.authenticated = false;
            obj.connection.close("LOGOUT");
            obj.connection = null;
            obj.session = null;
        },
        digestWrapper: function (func) {
            return function (args, kwargs, details) {
                func(args, kwargs, details);
                $rootScope.$applyAsync();
            };
        },
        register: function (topic, func) {
            if (obj.connection.isConnected)
                return obj.session.register(topic, obj.digestWrapper(func));
            else
                console.log('[WAMP] no open connection');
        },
        call: function (topic, args, callback, errorCallback) {
            if (obj.connection.isConnected)
                obj.session.call(topic, args).then(function (data) {
                    obj.digestWrapper(callback)(data);
                }, function (error) {
                    obj.digestWrapper(errorCallback)(error);
                });
            else
                console.log('[WAMP] no open connection');
        },
        subscribe: function (topic, callback, options) {
            if (obj.connection.isConnected)
                return obj.session.subscribe(topic, obj.digestWrapper(callback), options);
            else
                console.log('[WAMP] no open connection');
        },
        publish: function (topic, args, kwargs, options) {
            if (obj.connection.isConnected)
                return obj.session.publish(topic, args, kwargs, options);
            else
                console.log('[WAMP] no open connection');
        },
        unsubscribe: function (subscription) {
            if (obj.connection.isConnected)
                return obj.session.unsubscribe(subscription);
            else
                console.log('[WAMP] no open connection');
        }
    };

    return obj;
}]);