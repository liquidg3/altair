/**
 * Gives every module a config(named) method so other people can easily get configs
 */
define(['dojo/_base/declare', 'dojo/Deferred', './_Base'], function (declare, Deferred, _Base) {

    return declare('altair/cartridges/module/plugins/Config', [_Base], {

        execute: function (module) {

            if(!module.resolvePath) {
                throw "The Config plugin requires the Paths plugin, make sure Paths has been setup.";
            }


            this.deferred = new Deferred();

            declare.safeMixin(module, {

                _configs: null,

                /**
                 * Loads you a config by name, relative to the module's dir
                 *
                 * @returns {dojo.deferred}
                 */
                parseConfig: function (named) {




                }
            });

            return this.inherited(arguments);
        }

    });


});