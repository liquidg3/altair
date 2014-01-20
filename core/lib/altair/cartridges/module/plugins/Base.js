/**
 * Your plugin must implement and return a deferred for every single one of these methods.
 */
define(['dojo/_base/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

        cartridge: null,
        constructor: function (cartridge) {
            this.cartridge = cartridge;
            if(!cartridge) {
                throw "You must pass an instance of a Cache Cartridge to constructor of any cache plugin.";
            }
        }
    });


});