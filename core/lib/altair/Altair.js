/**
 * Well, this is it... Altair in its entirety. The whole application is simply a cartridge loader. These cartridges are
 * responsible for enhancing the environment in various ways. It should be really easy to augment the platform at a very
 * low level this way. Chances are that if you need to add new functionality into the platform you should be doing it
 * as a module. The only things that should be cartridges are components that need to exist before the module system
 * is ready. Currently, this is things like Nexus, Cache, Database, and a few others. See core/config/altair.json to see
 * the current config.
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang'
            ], function (declare, Deferred, lang) {



    return declare(null, {

        _cartridges:    {},

        /**
         * Add an un-started cartridge and I'll add it to the system and start it up.
         *
         * @param cartidge
         * @returns dojo/Deferred
         */
        addCartridge: function (cartidge) {

            this._cartridges[cartidge.key] = cartidge;

            return cartidge.startup();

        },

        /**
         * Removes a cartridge, but tears it down irst
         *
         * @param key
         * @returns dojo/Deferred
         */
        removeCartridge: function (key) {

            var def = this.cartridge(key).teardown();

            delete this._cartridges[key];

            return def;

        },

        /**
         * Get a cartridge by it's key
         *
         * @param key
         * @returns {*|null}
         */
        cartridge: function (key) {
            return this._cartridges[key] || null;
        },

        /**
         * Add an array of cartridges. Each next cartridge will wa
         *
         * @param cartridges
         * @returns dojo/Deferred
         */
        addCartridges: function (cartridges) {

            var deferred = new Deferred();

            var load = lang.hitch(this, function () {

                var cartridge = cartridges.pop();

                if(cartridge) {
                    this.addCartridge(cartridge).then(load);
                } else {
                    deferred.resolve(this);
                }
            });

            load();

            return deferred;

        }

    });
});