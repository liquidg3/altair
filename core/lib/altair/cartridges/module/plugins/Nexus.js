/**
 * Gives each module a nexus() function that will resolve nexus('') calls
 */
define(['dojo/_base/declare', 'dojo/Deferred', './_Base'], function (declare, Deferred, _Base) {

    return declare('altair/cartridges/module/plugins/Nexus', [_Base], {

        execute: function (module) {

            declare.safeMixin(module, {
                nexus: function (name, options, config) {
                    return 'bar';
                }
            });

            return this.inherited(arguments);
        }

    });


});