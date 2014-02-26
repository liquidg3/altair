/**
 * Help us resolve Adapters
 *
 * {{Vendor}}:{{Module}}::/path/to/Adapter
 *
 *
 */
define(['dojo/_base/declare',
        'altair/cartridges/nexus/_ResolverBase',
        'dojo/Deferred',
        'dojo/node!fs'
        ], function (declare,
                     _ResolverBase,
                     Deferred,
                     fs) {

    return declare('altair/modules/adapters/nexusresolvers/Adapters', [_ResolverBase], {


        nexus: null,
        adapterCache: null,

        constructor: function (nexus) {
            this.nexus = nexus;
            if(!nexus) {
                throw "The Adapters plugin needs nexus.";

            }

            this.adapterCache = [];
        },


        resolve: function (key, options, config) {

            var parts   = key.split('::'),
                module  = this.nexus.resolve(parts[0]),
                adapter = parts[1],
                d       = new Deferred();


            if( this.adapterCache.hasOwnProperty( key ) ) {
                d.resolve(this.adapterCache[key]);

            } else {

                return module.adapter(adapter);
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

            return key.search('::adapters/') > 0;
        }

    });

});