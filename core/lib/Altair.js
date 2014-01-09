define(['dojo/_base/declare', 'dojo/Deferred', 'dojo/_base/lang'], function (declare, Deferred, lang) {

    return declare(null, {

        deferred: null,
        _cartridges: {},
        startup: function (config) {
            return this;
        },
        go: function () {

            this.deferred = new Deferred();

            return this.deferred;

        },

        teardown: function () {

            Object.keys(this._cartridges).forEach(lang.hitch(this,function (key) {
                this.removeCartride(key);
            }));

            return this;

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