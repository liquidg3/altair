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
         * On startup, add Adapter Resolver to nexus. Also add the adapter field type to Apollo
         *
         * @returns {*}
         */
        startup: function () {

            //nexus resolve for adapters, e.g. Altair:Commander::adapters/Prompt or Altair:Commander::adapters/Blessed
            var resolver            = new Adapters(this._nexus),
                apolloCartridge     = this.nexus('cartridges/Apollo');

            if(!apolloCartridge) {
                this.deferred = new this.Deferred();
                this.deferred.reject('You need the Apollo cartridge enabled to use adapters.');
            } else {
                this._nexus.addResolver(resolver);
            }


            return this.inherited(arguments);
        }

    });

});