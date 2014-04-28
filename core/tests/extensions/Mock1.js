/**
 * A plugin for testing, do not use
 */
define(['altair/facades/declare',
        'altair/cartridges/extension/extensions/_Base'], function (declare, _Base) {

    return declare([_Base], {

        name: 'mock1',
        foo: 'bar',
        _handles: 'module',
        extend: function (Module) {

            Module.extendOnce({

                _count: 0,
                foo: function () {
                    return 'bar1';
                },

                counter: function () {
                    return this._count ++;
                }

            });

            return this.inherited(arguments);
        }

    });


});