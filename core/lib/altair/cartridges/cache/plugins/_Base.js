/**
 * Your plugin must implement and return a deferred for every single one of these methods.
 */
define(['altair/facades/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare('altair/cartridges/cache/plugins/_Base', [Lifecycle], {

        cartridge: null,
        constructor: function (cartridge) {
            this.cartridge = cartridge;
            if(!cartridge) {
                throw "You must pass an instance of a Cache Cartridge to constructor of any cache plugin.";
            }
        },
        get: function (key, defaultValue) {},
        set: function (key, value, tags) {},
        has: function (key) {},
        unset: function (key) {}
    });


});