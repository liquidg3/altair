define(['dojo/_base/declare', 'dojo/_base/lang'], function (declare, lang) {

    return declare('altair/cartridges/Nexus', {

        _cartridges: [],
        startup: function (config) {

            console.log(config);

            return this;
        },

        teardown: function () {

            this._cartridges.forEach(lang.hitch(this, function (cartridge) {
                cartridge.teardown();
            }));


            this._cartridges = [];

            return this;
        }


    });


});