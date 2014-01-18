/**
 * Gives each module a nexus() function that will resolve nexus('') calls
 */
define(['dojo/_base/declare', 'dojo/Deferred', './Base'], function (declare, Deferred, Base) {

    return declare([Base], {

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