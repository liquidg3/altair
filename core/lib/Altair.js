define(['dojo/_base/declare', 'dojo/Deferred'], function (declare, Deferred) {

    return declare(null, {

        deferred: null,
        _cartridges: {},
        startup: function (config) {
            console.log(config);
            return this;
        },
        go: function () {

            this.deferred = new Deferred();

            return this.deferred;

        },

        teardown: function () {

            console.log('shutdown');

        },

        addCartridge: function (key, cartidge, config) {
            this._cartridges[key] = cartidge;
            cartidge.startup(config);
            return this;
        },

        removeCartride: function (key) {
            this.cartridge(key).teardown();
            delete this._cartridges[key];
            return this;
        },

        cartridge: function (key) {
            return this._cartridges[key];
        }

    });


});