/**
 *  We do a check if the module inherits from apollo/_HasConfigMixin. If it does, I make the gnarly assumption you have
 *  put the schema inside of path/to/module/config/schema.json. Is that a dick move? Nah, everyone will think that's
 *  "just how Apollo works." But, we'll know it's really the Apollo Cartridge that makes it work that way ;)
 */
define(['altair/facades/declare',
         './_Base',
         'altair/facades/hitch',
         'apollo/_HasSchemaMixin',
         'altair/Deferred'],

    function (declare,
              _Base,
              hitch,
              _HasSchemaMixin,
              Deferred) {

    return declare([_Base], {

        name: 'apollo',

        startup: function () {

            //we have to make sure we have our dependent plugins loaded
            if(!this.altair.hasCartridge('apollo')) {
                throw new Error("You must have the 'apollo' cartridge enabled.");
            }
            //only 1 error at a time, now check for the config plugin
            else if(!this.cartridge.hasExtension('config')) {
                throw new Error("Please make sure you have the 'config' enabled.");
            }

            return this.inherited(arguments);

        },

        /**
         * Called once for each module.
         *
         * @param module
         * @returns {*}
         */
        execute: function (module) {

            if(module.isInstanceOf(_HasSchemaMixin) && module.schemaPath) {

                //override startup to mixin options as values
                declare.safeMixin(module, {

                    startup: function (options) {

                        if(options) {
                            this.mixin(options);
                        }

                        return this.inherited(arguments);
                    }
                });

                this.deferred = new Deferred();

                //parse the config, then build the schema
                module.parseConfig(module.schemaPath).then(hitch(this, function (schemaData) {

                    //use apollo to create the schema
                    var apollo = this.altair.cartridge('apollo').apollo,
                        schema = apollo.createSchema(schemaData);

                    //set the schema to the module
                    module.setSchema(schema);

                    this.deferred.resolve(this);

                }), hitch(this, function (err) {

                    //since the schema is optional, create one that is empty
                    var apollo = this.altair.cartridge('apollo').apollo,
                        schema = apollo.createSchema({});

                    //set the schema to the module
                    module.setSchema(schema);

                    this.deferred.resolve(this);

                }));

            }

            return this.inherited(arguments);
        }

    });


});