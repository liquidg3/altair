/**
 * Resolver to make all cartridges is Altair available via nexus, e.g. this.nexus('cartridges/Apollo')
 */
define(['dojo/_base/declare',
        'altair/cartridges/nexus/_ResolverBase',
        'altair/facades/hitch'
], function (declare,
             _ResolverBase,
             hitch) {

    return declare([_ResolverBase], {

        nexus:          null,
        altair:         null,

        constructor: function (nexus) {

            this.nexus      = nexus;
            this.altair     = nexus.altair;

            if(!nexus) {
                throw "The Adapters plugin needs nexus.";
            }
        },

        /**
         * Find a cartridge using a simple match
         *
         * @param key
         * @param options
         * @param config
         * @returns {*}
         */
        resolve: function (key, options, config) {

            var match = null,
                _key  = key.toLowerCase();


            Object.keys(this.altair.cartridges()).forEach(hitch(this, function (named) {

                if(named.search(_key) > 0) {
                    match = this.altair.cartridge(named);
                }

            }));

            return match;

        },

        /**
         * Tells us if we handle a key.
         *
         * @param key
         * @returns {boolean}
         */
        handles: function (key) {
            return key.search('cartridges/') === 0;
        }

    });

});