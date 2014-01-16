/**
 * Your plugin must implement and return a deferred for every single one of these methods.
 */
define(['dojo/_base/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

        cacheCartridge: null,
        constructor: function (cacheCartridge) {
            this.cacheCartridge = cacheCartridge;
            if(!cacheCartridge) {
                throw "You must pass an instance of a Cache Cartridge to constructor of any cache plugin.";
            }
        },
        get: function (key, defaultValue) {},
        set: function (key, value, tags) {},
        has: function (key) {},
        unset: function (key) {}
    });


});