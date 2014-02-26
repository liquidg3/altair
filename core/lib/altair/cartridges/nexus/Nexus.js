/**
 * Nexus is the piece that connects all things in Altair. It uses Resolvers in a sort of Chain of Responsibility
 * implementation that gives any Altair dev the ability to get what they need, when they need it, while exposing
 * an extremely simple API.
 *
 * You can also set arbitrary values to arbitrary keys. But, the real power of Nexus comes from its resolvers.
 *
 * A resolver is an object that has 2 methods, handles(key) and resolve(key, options, config). See ./ResolverBase
 * for a stub class you can mixin.
 *
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    '../_Base'],
                function (declare,
                          lang,
                          _Base) {


    return declare('altair/cartridges/nexus/Nexus', [_Base], {

        _resolvers: null,
        _map:       null,

        constructor: function (altair) {

            this._resolvers = [];
            this._map       = {};

            //easy alias for nexus('Altair');
            this.set('Altair', altair);

            //easy alias for nexus('Nexus')
            this.set('Nexus', this);

        },

        /**
         * If no resolver was passed, instantiate one. Then, setup some basic stuff that we know would be useful.
         *
         * @param options
         * @returns {*}
         */
        startup: function (options) {

            var _options = options || this.options;

            //setup new resolver if one is not passed
            if (_options.resolvers) {
                _options.resolvers.forEach(lang.hitch(this, function (resolver) {
                    this.addResolver(resolver);
                }));
            }

            return this.inherited(arguments);
        },

        /**
         * clear resolvers and reset our map
         *
         * @returns {*}
         */
        teardown: function () {

            this._map       = [];
            this._resolvers = [];

            return this.inherited(arguments);
        },

        /**
         * For setting any value to any key. If you want to get a value, use resolve.
         *
         * @param key
         * @param value
         * @returns {altair.Lifecycle}
         */
        set: function (key, value) {
            this._map[key] = value;

            return this;
        },

        /**
         * Append a resolver to be used in resolve()
         *
         * @param resolver
         * @returns {altair.Lifecycle}
         */
        addResolver: function (resolver) {
            this._resolvers.push(resolver);

            return this;
        },

        /**
         * Try and find the value by key by first checking my local may, then looping through
         * each resolver and letting it try
         *
         * @param key
         * @param options
         * @param config
         * @returns {*}
         */
        resolve: function (key, options, config) {

            var c;

            if( this._map.hasOwnProperty( 'key' ) ) {
                return this._map[key];

            }

            for( c = 0; c < this._resolvers.length; c++ ) {
                if(this._resolvers[c].handles(key)) {

                    return this._resolvers[c].resolve( key, options, config );
                }

            }

            return null;
        }

    });

});