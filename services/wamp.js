let wamp_module = angular.module('ws.services.wamp', []);

wamp_module.factory('$wamp', ['Notification', '$q', function($notif, $q) {
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
        }
    };

    return obj;
}]);