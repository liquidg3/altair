/**
 * The Adapters module's only real job is registering the adapter resolver with nexus. It uses the has _HasAdaptersMixin,
 * for unit tests
 */

define(['dojo/_base/declare',
        'altair/modules/adapters/mixins/_HasAdaptersMixin',
        'altair/modules/adapters/nexusresolvers/Adapters',
        'altair/Lifecycle'],
    function (declare,
              _HasAdaptersMixin,
              Adapters,
              Lifecycle) {

    return declare('altair/modules/adapters/Adapters', [_HasAdaptersMixin, Lifecycle], {

        /**
         * On startup, add Adapter Resolver to nexus
         *
         * @returns {*}
         */
        startup: function () {

            var resolver = new Adapters(this._nexus);
            this._nexus.addResolver(resolver);

            return this.inherited(arguments);
        }

    });

});