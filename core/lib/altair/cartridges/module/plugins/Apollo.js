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

        execute: function (module) {


            if(module.isInstanceOf(_HasSchemaMixin)) {

                //we have to make sure we have our dependent plugins loaded
                if(!this.cartridge.altair.hasCartridges(['altair/cartridges/apollo/Apollo'])) {
                    throw "You must have the 'altair/cartridges/apollo/Apollo' cartridge enabled.";
                }

                //we also depend on the parseConfig method, usually given to us by our Config plugin
                if(!module.parseConfig) {
                    throw "Please make sure you have the 'altair/cartridges/module/plugins/Config' enabled."
                }

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