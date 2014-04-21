/**
 *  We do a check if the module inherits from apollo/_HasSchemaMixin and then decide what do do based on
 *  whether there is a schemaPath or a _schema (object literal).
 *
 *  This extension also ensures options whose keys match properties in the schema will get set.
 */
define(['altair/facades/declare',
         './_Base',
         'altair/facades/hitch',
         'apollo/_HasSchemaMixin',
         'apollo/Schema',
         'altair/Deferred'],

    function (declare,
              _Base,
              hitch,
              _HasSchemaMixin,
              Schema,
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

            if(module.isInstanceOf(_HasSchemaMixin)) {

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

                //if there is a path to a schema, lets parse it and load it
                if(module.schemaPath) {


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
                //if the schema is set to _schema as an object, then create a schema from it
                else if(module._schema) {

                    //is there a schema?
                    if(!module._schema.isInstanceOf || !module._schema.isInstanceOf(Schema)) {

                        var schema = this.altair.cartridge('apollo').createSchema(module._schema);
                        module.setSchema(schema);

                    }

                    this.deferred.resolve(this);

                }

            }

            return this.inherited(arguments);
        }

    });


});