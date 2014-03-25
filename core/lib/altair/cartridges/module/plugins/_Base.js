/**
 * Your plugin must implement and return a deferred for every single one of these methods.
 */
define(['dojo/_base/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

        cartridge: null,
        altair:    null,
        declaredClass: false,
        constructor: function (cartridge, altair) {
            this.cartridge  = cartridge;
            this.altair     = altair || cartridge.altair;
            if(!this.declaredClass) {
                throw new Error('You must define a .declaredClass for your module plugin.');
            }
            if(!cartridge) {
                throw "You must pass an instance of a Cache Cartridge to constructor of any cache plugin.";
            }
        }

    });


});