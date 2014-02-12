/**
 * Gives every module a config(named) method so other people can easily get configs
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        './_Base',
        'dojo/_base/lang',
        'require'],

    function (declare,
              Deferred,
              _Base,
              lang,
              require) {

    return declare('altair/cartridges/module/plugins/Config', [_Base], {

        execute: function (module) {

            if(!module.resolvePath) {
                throw "The Config plugin requires the altair/cartridges/module/plugins/Paths plugin, make sure Paths has been setup.";
            }

            declare.safeMixin(module, {

                _configs: null,

                /**
                 * Loads you a config by name, relative to the module's dir
                 *
                 * @returns {dojo.deferred}
                 */
                parseConfig: function (named) {

                    var deferred = new Deferred();

                    if(!this._configs) {
                        this._configs = {};
                    }

                    if(named in this._configs) {
                        deferred.resolve(this._configs[named]);
                    } else {

                        var path = this.resolvePath(named);

                        require(['altair/plugins/config!' + path], lang.hitch(this, function (config) {

                            this._configs[named] = config;

                            deferred.resolve(config);

                        }));

                    }



                    return deferred;


                }
            });

            return this.inherited(arguments);
        }

    });


});