/**
 * A plugin for testing, do not use
 */
define(['dojo/_base/declare', './Base'], function (declare, Base) {

    return declare('altair/cartridges/module/plugins/Mock',[Base], {

        foo: 'bar',
        execute: function (module) {

            declare.safeMixin(module, {
                foo: function () {
                    return 'bar';
                }
            });

            return this.inherited(arguments);
        }

    });


});