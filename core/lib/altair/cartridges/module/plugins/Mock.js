/**
 * A plugin for testing, do not use
 */
define(['dojo/_base/declare', './_Base'], function (declare, _Base) {

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Mock',
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