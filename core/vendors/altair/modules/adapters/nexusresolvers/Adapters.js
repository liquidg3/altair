/**
 * Help us resolve Adapters
 *
 * {{Vendor}}:{{Module}}::/path/to/Adapter
 *
 *
 */
define(['altair/facades/declare',
        'altair/cartridges/nexus/_ResolverBase',
        'dojo/Deferred',
        'dojo/node!fs'
        ], function (declare,
                     _ResolverBase,
                     Deferred,
                     fs) {

    return declare([_ResolverBase], {


        nexus:          null,
        adapterCache:   null,

        constructor: function (nexus) {
            this.nexus = nexus;
            if(!nexus) {
                throw "The Adapters plugin needs nexus.";

            }

            this.adapterCache = [];
        },

        /**
         * Find the adapter of your choosing.
         *
         * @param key
         * @param options
         * @param config
         * @returns {*}
         */
        resolve: function (key, options, config) {

            var parts   = key.split('/'),
                module  = this.nexus.resolve(parts.shift()),
                adapter = parts.join('/'),
                d       = new Deferred();


            if( this.adapterCache.hasOwnProperty( key ) ) {
                d.resolve(this.adapterCache[key]);

            } else {
                d = module.adapter(adapter);
            }

            return d;
        },

        /**
         * Tells us if we handle a key.
         *
         * @param key
         * @returns {boolean}
         */
        handles: function (key) {
            return key.search('/adapters/') > 0;
        }

    });

});