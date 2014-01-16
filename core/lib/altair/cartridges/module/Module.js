/**
 * @required Nexus cartridge
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    '../Base',
    'dojo/Deferred',
    './Foundry'], function (declare,
                            lang,
                            Base,
                            Deferred,
                            Foundry) {

    return declare([Base], {

        foundry:    null,
        modules:    [],

        /**
         * Load up the modules.
         *
         * @param options {
         *
         *      modules:    ['array', 'of', 'module', 'names', 'that', 'will', 'be', 'created'],
         *      paths:      ['array', 'of', 'paths', 'to', 'look', 'for', 'modules'],
         *      dataStore:  configured instance of altair/cartridges/modules/DataStore
         *
         * }
         */
        startup: function (options) {

            options = options || this.options;

            var modules = options.modules,
                list    = [];

            this.deferred = new Deferred();


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

            else {

                this.foundry.build({
                    paths: options.paths,
                    modules: options.modules
                }).then(lang.hitch(this, function (modules) {

                    this.modules = modules;
                    this.deferred.resolve(this);

                }));


            }


            return this.inherited(arguments);

        }



    });


});