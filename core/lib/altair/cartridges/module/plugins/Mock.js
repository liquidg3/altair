/**
 * A plugin for testing, do not use
 */
define(['dojo/_base/declare', './_Base'], function (declare, _Base) {

    return declare('altair/cartridges/module/plugins/Mock',[_Base], {

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