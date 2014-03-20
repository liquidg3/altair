/**
 * Facade for easy translations
 */
define(['./hitch', 'altair/plugins/node!i18n-2'], function (hitch, i18n) {

    "use strict";

    var i = new i18n({
            locales: ['en'],
            devMode: false
        }),
        __ = function () {
        return i.__.apply(i, arguments);
    };

    __.n = function (singular, plural, count) {
        return i.__n.apply(singular, plural, count);
    };

    return __;

});
