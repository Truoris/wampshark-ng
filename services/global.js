let global_module = angular.module('ws.services.global', []);

global_module.factory('$global', [function() {
    var obj = {
        data: {
            page: "home",
            loading: false,
            callbacks: [],
            breadcrumb: []
        },
        breadcrumb: {
            clear: function () {
                obj.data.breadcrumb = [];
            },
            add: function (label, link) {
                obj.data.breadcrumb.push({
                    label: label,
                    link: link
                });
            }
        },
        page: {
            set: function (page) {
                obj.data.page = page;
                obj.update.raise();
            }
        },
        update: {
            subscribe: function (callback) {
                obj.data.callbacks.push(callback);
            },
            raise: function (callback) {
                for (var i in obj.data.callbacks) {
                    obj.data.callbacks[i]();
                }
            }
        },
        loading: {
            start: function () {
                obj.data.loading = true;
            },
            stop: function () {
                obj.data.loading = false;
            }
        }
    };

    return obj;
}]);