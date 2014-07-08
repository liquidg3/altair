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
    'altair/facades/home',
    'altair/facades/all',
    'altair/plugins/node!path'
],
    function (declare, Deferred, _, hitch, home, all, path) {

        "use strict";

        return declare(null, {

            _cartridges: null,
            env:         'dev',
            paths:       null,
            safeMode:    false,
            home:       '',

            constructor: function (options) {

                var _options = options || {};

                this.paths = _options.paths || [];
                this.env = _options.env || 'dev';
                this.safeMode = _.has(_options, 'safeMode') ? _options.safeMode : false;
                this.home = _.has(_options, 'home') ? _options.home : path.join(home(), '.altair');

                this._cartridges = {};
            },

            /**
             * Resolve a path against  the last path in my paths. home by default
             *
             * @param p String
             * @returns {String}
             */
            resolvePath: function (p) {

                var resolved = p;

                if(p[0] != path.sep) {
                    resolved = path.join(require.toUrl(this.paths[this.paths.length - 1]), p);
                }

                return resolved;

            },

            /**
             * Add an un-started cartridge and I'll add it to the system and start it up. optionally i will execute it.
             *
             * @param cartridge
             * @param execute should I execute the cartridge after startup??
             * @returns {altair.Promise}
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
             * @returns {altair.Promise}
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
             * Add a collection of cartridges. Each cartridge will be started up AFTER the one before it. This is to ensure
             * dependencies are in place before dependants are loaded.
             *
             * @param cartridges
             * @returns {altair.Promise}
             */
            addCartridges: function (cartridges) {

                var deferred = new Deferred(),
                    deferred2 = new Deferred(),
                    started = [],
                    add = hitch(this, function () {

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

            /**
             * Teardown every cartridge.
             *
             * @returns {*}
             */
            teardown: function () {

                var l = _.map(this._cartridges, function (c) {
                    return c.teardown();
                });

                return all(l);

            },

            toString: function () {
                return '[object Altair]';
            }

        });
    });
