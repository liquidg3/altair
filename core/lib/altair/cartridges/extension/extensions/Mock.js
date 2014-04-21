/**
 * A plugin for testing, do not use
 */
define(['altair/facades/declare',
        './_Base'], function (declare, _Base) {

    return declare([_Base], {

        name: 'mock',
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