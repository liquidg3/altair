/**
 * @required Nexus cartridge
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    'altair/Lifecycle',
    './Foundry'], function (declare,
                            lang,
                            Lifecycle,
                            Foundry) {

    return declare([Lifecycle], {

        foundry: null,

        /**
         * Load up the modules.
         *
         * @param options {
         *
         *      modules:    ['array', 'of', 'module', 'names'],
         *      dataStore:  configured instance of altair/cartridges/modules/DataStore
         *
         * }
         */
        startup: function (options) {

            options = options || this.options;

            var modules = options.modules,
                list    = [];


            if(!modules) {
                throw "The Modules Cartridge needs some modules, yo.";
            }

            //pass through altair if it was passed
            this.altair = options.altair;

            /**
             * Was a foundry passed? if not, lets create one
             */
            if(!options || !options.foundry) {
                this.foundry = new Foundry();
            } else {
                throw "Not finished, should this set directly or assume something needs to be loaded?";
            }

            /**
             * If there is a datastore, we'll use it to get the enabled modules
             */
            if(options.dataStore) {

                throw "Not finished, need to figure out how to do this one";
            }
            //assume modules are nexus names
            else {

                modules.forEach(lang.hitch(this, function (module) {

                }));

            }


            return this.inherited(arguments);

        }



    });


});