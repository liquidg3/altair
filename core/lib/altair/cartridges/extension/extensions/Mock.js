/**
 * A plugin for testing, do not use
 */
define(['altair/facades/declare',
        './_Base'], function (declare, _Base) {

    return declare([_Base], {

        name: 'mock',
        foo: 'bar',
        extend: function (Module) {

            Module.extend({

                _count: 0,
                foo: function () {
                    return 'bar';
                },

                counter: function () {
                    return this._count ++;
                }

            });

            return this.inherited(arguments);
        }

    });


});