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
         'apollo/_HasSchemaMixin',
         'apollo/Schema'],

    function (declare,
              _Base,
              Deferred,
              hitch,
              _HasSchemaMixin,
              Schema) {

    return declare([_Base], {

        name: 'apollo',

        startup: function () {

            this.deferred = new this.Deferred();

            //we have to make sure we have our dependent plugins loaded
            if(!this.altair.hasCartridge('apollo')) {
                this.deferred.reject(new Error("You must have the 'apollo' cartridge enabled."));
                return this.inherited(arguments);
            }
            //only 1 error at a time, now check for the config plugin
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

            if(Module.prototype.isInstanceOf(_HasSchemaMixin) && !Module.prototype._willMixinOnStartup) {

                Module.extendOnce({
                    _willMixinOnStartup: true
                });

                //override startup to mixin options as values
                Module.extendBefore({
                    startup: function (options, old) {

                        if(options) {
                            this.mixin(options);
                        }

                        if(!old) {
                            old = new Deferred();
                            old.resolve(this);
                        } else {
                            old = old(options);
                        }

                        return old;

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