/**
 *  We do a check if the module inherits from apollo/_HasSchemaMixin and then decide what do do based on
 *  whether there is a schemaPath or a _schema (object literal).
 *
 *  This extension also ensures options whose keys match properties in the schema will get set.
 */
define(['altair/facades/declare',
         './_Base',
         'altair/Deferred',
         'altair/facades/hitch',
         'altair/facades/when',
         'apollo/_HasSchemaMixin',
         'apollo/Schema'],

    function (declare,
              _Base,
              Deferred,
              hitch,
              when,
              _HasSchemaMixin,
              Schema) {

    return declare([_Base], {

        name: 'apollo',

        startup: function () {

            this.deferred = new this.Deferred();

            //we have to make sure we have our dependent cartridges & extensions loaded
            if(!this.altair.hasCartridge('apollo')) {
                this.deferred.reject(new Error("You must have the 'apollo' cartridge enabled."));
                return this.inherited(arguments);
            }
            //now check for the config extension
            else if(!this.cartridge.hasExtension('config')) {
                this.deferred.reject(new Error("Please make sure you have the config extension enabled."));
            } else {
                this.deferred.resolve(this);
            }

            //if the module cartridge is installed, hook into forge
            if(this.altair.hasCartridge('module')) {

                var m = this.altair.cartridge('module');
                m.on('did-forge-module').then(this.hitch('onDidForgeModule'));

            }

            return this.inherited(arguments);

        },

        /**
         * Extend prototype to mixin options to check if they match fields
         *
         * @param Module
         */
        extend: function (Module) {

            if(Module.prototype.isInstanceOf(_HasSchemaMixin) && !Module.prototype.__willMixinSchemaValuesOnStartup) {

                Module.extendOnce({
                    __willMixinSchemaValuesOnStartup: true
                });

                //override startup to mixin options as values (unless options has a values key, then we use that)
                Module.extendBefore({
                    startup: function (options, old) {

                        var values = {},
                            dfd;

                        if(options) {

                            if(_.has(options, '_schema')) {
                                this.setSchema(options._schema);
                            }

                            if(_.has(options, 'values')) {
                                values = options.values;
                            } else {
                                values = options;
                            }

                            if(!this._schema) {
                                throw new Error('Schema missing for ' + this);
                            }

                            if(values) {
                                dfd = this.mixin(values);
                            }
                        }

                        if(!old) {

                            if(!dfd) {
                                dfd = new Deferred();
                                dfd.resolve(this);
                            }

                            return when(dfd);

                        } else {

                            return when(dfd).then(function () {

                                return old(options);

                            })
                        }

                    }
                });

            }

        },

        /**
         * Help load schemas
         *
         * @param module
         * @returns {*}
         */
        execute: function (module) {

            if(module.isInstanceOf(_HasSchemaMixin)) {

                this.deferred = new this.Deferred();

                //if there is a path to a schema, lets parse it and load it
                if(module.schemaPath) {

                    //parse the config, then build the schema
                    module.parseConfig(module.schemaPath).then(hitch(this, function (schemaData) {

                        try {

                            //use apollo to create the schema
                            var apollo = this.altair.cartridge('apollo').apollo,
                                schema = apollo.createSchema(schemaData);

                            //set the schema to the module
                            module.setSchema(schema);

                            this.deferred.resolve(this);

                        } catch(err) {

                            this.deferred.reject(err);
                        }


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

                    } else {

                        module.setSchema(module._schema);

                    }

                    this.deferred.resolve(this);

                } else {

                    this.deferred.resolve(this);

                }

            }

            return this.inherited(arguments);
        },


        /**
         * Whenever a module is forged, we need to setup the package path
         *
         * @param e
         */
        onDidForgeModule: function (e) {

            var module = e.get('module');

            if(!module.schemaPath) {
                module.schemaPath = 'configs/schema';
            }

        }

    });


});