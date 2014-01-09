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
        'dojo/DeferredList',
        'dojo/_base/lang',
        'altair/Base',
        'altair/cartridgeFactory'
            ], function (declare, Deferred, DeferredList, lang, Base, CartridgeFactory) {



    return declare([Base], {

        _cartridges:    {},
        _cartridgeFactory: null,

        startup: function (options) {


            /**
             * Create any cartridges passed via the config.
             */
            if(options && options.cartridges) {

                if(!options.cartridgeFactory) {
                    options.cartridgeFactory = new CartridgeFactory();
                }

                options.cartridgeFactory.build(options.cartridges);
            }

            this.deferred = new Deferred();

            var list,
                deferreds = [];

            Object.keys(this._cartridges).forEach(lang.hitch(this, function (key) {
                deferreds.push(this._cartridges[key].startup(this.config[key] || {}));
            }));

            //fire after all deferred's have run
            list = new DeferredList(deferreds);
            list.then(lang.hitch(this, function() {
                this.deferred.resolve(this);
            }));

            return this.deferred;

        },

        go: function () {
            this.deferred = new Deferred();



            return this.deferred;
        },

        teardown: function () {

            Object.keys(this._cartridges).forEach(lang.hitch(this, function (key) {
                this.removeCartridge(key);
            }));

            return this.inherited(arguments);

        },

        addCartridge: function (key, cartidge, options) {

            this._cartridges[key] = cartidge;

            return this;

        },

        removeCartridge: function (key) {

            this.cartridge(key).teardown();

            delete this._cartridges[key];

            return this;

        },

        cartridge: function (key) {
            return this._cartridges[key] || null;
        }

    });
});