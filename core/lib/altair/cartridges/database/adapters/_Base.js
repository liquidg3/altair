define(['altair/facades/declare',
        'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

        _cartridge: null,

        constructor: function (cartridge, options) {

            this._cartridge = cartridge;
            this.options = options;


        }


    });

});