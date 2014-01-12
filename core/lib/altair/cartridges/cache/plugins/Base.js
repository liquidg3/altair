/**
 * Your plugin must implement and return a deferred for every single one of these methods.
 */
define(['dojo/_base/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {
        get: function (key, defaultValue) {},
        set: function (key, value, tags) {},
        has: function (key) {},
        unset: function (key) {}
    });


});