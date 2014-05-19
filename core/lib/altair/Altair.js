/**
 * Well, this is it... Altair in its entirety. The whole platform is simply a cartridge loader. These cartridges are
 * responsible for enhancing the environment in various ways. It should be really easy to augment the platform at a very
 * low level this way. Chances are that if you need to add new functionality into the platform you should be doing it
 * as a module. The only things that should be cartridges are components that need to exist before the module system
 * is ready. Currently, this is things like Nexus (Dependency Injection), Apollo (ORM), Cache, Database, and a few others.
 * See core/config/altair.json to see the current config.
 */
define(['altair/facades/declare',
    'altair/Deferred',
    'lodash',
    'altair/facades/hitch',
    'altair/facades/all'
],
    function (declare, Deferred, _, hitch) {

        "use strict";

        return declare(null, {

            _cartridges: null,
            env:         'dev',
            paths:       null,

            constructor: function (options) {

                if (options) {
                    this.paths = options.paths || [];
                    this.env = options.env || 'dev';
                }

                this._cartridges = {};
            },

            /**
             * Add an un-started cartridge and I'll add it to the system and start it up. optionally i will execute it.
             *
             * @param cartridge
             * @param execute should I execute the cartridge after startup??
             * @returns {altair.Deferred}
             */
            addCartridge: function (cartidge, execute) {

                this._cartridges[cartidge.name] = cartidge;

                return cartidge.startup().then(function (cartridge) {
                    if (execute !== false) {
                        return cartridge.execute();
                    } else {
                        return cartridge;
                    }
                });


            },

            /**
             * Removes a cartridge, but tears it down first.
             *
             * @param key
             * @returns {altair.Deferred}
             */
            removeCartridge: function (name) {

                var def = this.cartridge(name).teardown();

                delete this._cartridges[name];

                return def;

            },

            /**
             * All the cartridges by name.
             *
             * @returns {object}
             */
            cartridges: function () {
                return this._cartridges;
            },

            /**
             * Get a cartridge by it's key
             *
             * @param key
             * @returns {*|null}
             */
            cartridge: function (name) {
                return this._cartridges[name] || null;
            },

            /**
             * Is this cartridge loaded?
             *
             * @param name
             * @returns {boolean}
             */
            hasCartridge: function (name) {
                return !!this._cartridges[name];
            },

            /**
             * Quick check if all the cartridges are loaded. If any single one is missing,
             * it returns false.
             *
             * @param namees
             * @returns {boolean}
             */
            hasCartridges: function (namees) {

                var i;

                for (i = 0; i < namees.length; i++) {
                    if (!this.hasCartridge(namees[i])) {
                        return false;
                    }
                }

                return true;
            },

            /**
             * Add an array of cartridges. Each cartridge will be started up AFTER the one before it. This is to ensure
             * dependencies are in place before dependants are loaded =)
             *
             * @param cartridges
             * @returns {altair.Deferred}
             */
            addCartridges: function (cartridges) {

                var deferred = new Deferred(),
                    deferred2 = new Deferred(),
                    started = [];

                //add all modules
                var add = hitch(this, function () {

                    var cartridge = cartridges.shift();

                    if (cartridge) {
                        started.push(cartridge);
                        this.addCartridge(cartridge, false).then(add).otherwise(hitch(deferred, 'reject'));
                    } else {
                        deferred.resolve(this);
                    }
                });

                add();

                //execute module
                var execute = hitch(this, function () {

                    var cartridge = started.shift();

                    if (cartridge) {
                        cartridge.execute().then(execute).otherwise(function (err) {
                            deferred2.reject(err);
                        });
                    } else {
                        deferred2.resolve(this);
                    }
                });

                return deferred.then(hitch(this, function () {

                    execute();
                    return deferred2;

                }));

            },

            teardown: function () {

                var l = _.map(this._cartridges, function (c) {
                     return c.teardown();
                });

                return all(l);

            }

        });
    });
