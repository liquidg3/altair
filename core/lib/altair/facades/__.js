/**
 * Facade for easy translations
 */
define(['./hitch', 'altair/plugins/node!i18n-2'], function (hitch, i18n) {

    "use strict";

    var i =  i18n,
        __ = function () {
        return i.__.apply(i, arguments);
    };

    __.n = function (singular, plural, count) {
        return i.__n(singular, plural, count);
    };

    return __;

});
