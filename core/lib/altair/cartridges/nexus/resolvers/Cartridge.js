/**
 * Resolver to make all cartridges is Altair available via nexus, e.g. this.nexus('cartridges/Apollo')
 */
define(['altair/facades/declare',
        'altair/cartridges/nexus/_ResolverBase',
        'altair/facades/hitch',
        'lodash'
], function (declare,
             _ResolverBase,
             hitch,
             _) {

    return declare([_ResolverBase], {

        nexus:          null,
        altair:         null,

        constructor: function (nexus) {

            this.nexus      = nexus;
            this.altair     = nexus.altair;

            if(!nexus) {
                throw "The nexus resolver nexus.";
            }
        },

        /**
         * Find a cartridge using a simple match (cartridges/Nexus)
         *
         * @param key a string that is the last parts of the cartridge.declaredClass, e.g. cartridges/Apollo
         * @param options
         * @param config
         * @returns {*}
         */
        resolve: function (key, options, config) {

            var match,
                all   = this.altair.cartridges(),
                _key  = key.toLowerCase().split('/').pop();


            return all[_key];

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