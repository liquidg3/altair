/**
 * Base class for all extensions
 */
define(['altair/facades/declare',
        'altair/Lifecycle'],

    function (declare,
              Lifecycle) {

    return declare([Lifecycle], {

        cartridge:      null,
        altair:         null,
        name:           false,
        constructor: function (cartridge, altair) {

            if(!cartridge) {
                throw new Error('You must pass your extension the Extension cartridge');
            }

            this.cartridge  = cartridge;
            this.altair     = altair || cartridge.altair;
            if(!this.name) {
                throw new Error('You must define a .name for your extension.');
            }
        }

    });


});