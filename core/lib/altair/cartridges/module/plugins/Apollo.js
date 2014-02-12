/**
 *  We do a check if the module inherits from apollo/_HasConfigMixin. If it does, I make the gnarly assumption you have
 *  put the schema inside of path/to/module/config/schema.json. Is that a dick move? Nah, everyone will think that's
 *  "just how Apollo works." But, we'll know it's really the Apollo Cartridge that makes it work that way ;)
 */
define(['dojo/_base/declare',
         './_Base',
         'dojo/_base/lang',
         'apollo/_HasSchemaMixin',
         'dojo/Deferred'],

    function (declare,
              _Base,
              lang,
              _HasSchemaMixin,
              Deferred) {

    return declare('altair/cartridges/module/plugins/Apollo',[_Base], {

        startup: function () {

            this.deferred = new Deferred();

            //we have to make sure we have our dependent plugins loaded
            if(!this.cartridge.altair.hasCartridges(['altair/cartridges/apollo/Apollo'])) {
                this.deferred.reject("You must have the 'altair/cartridges/apollo/Apollo' cartridge enabled.");
            }
            //only 1 error at a time, now check for the config plugin
            else if(!this.cartridge.hasPlugin('altair/cartridges/module/plugins/Config')) {
                this.deferred.reject("Please make sure you have the 'altair/cartridges/module/plugins/Config' enabled.");
            } else {
                this.deferred.resolve(this);
            }


            return this.inherited(arguments);
        },

        execute: function (module) {


            if(module.isInstanceOf(_HasSchemaMixin)) {

                this.deferred = new Deferred();

                //parse the config, then build the schema
                module.parseConfig('config/schema').then(lang.hitch(this, function (schemaData) {

                    var apollo = this.cartridge.altair.cartridge('altair/cartridges/apollo/Apollo').apollo,
                        schema = apollo.createSchema(schemaData);

                    module.setSchema(schema);

                    this.deferred.resolve(this);


                }), function (err) {
                    throw err;
                });

            }

            return this.inherited(arguments);
        }

    });


});