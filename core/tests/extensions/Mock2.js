/**
 * A plugin for testing, do not use
 */
define(['altair/facades/declare',
        'altair/cartridges/extension/extensions/_Base'], function (declare, _Base) {

    return declare([_Base], {

        name: 'mock2',
        foo: 'bar',
        _handles: ['module'],
        extend: function (Module) {

            Module.extendOnce({

                _count: 0,
                foo2: function () {
                    return 'bar2';
                },

                counter: function () {
                    return this._count ++;
                }

            });

            return this.inherited(arguments);
        }

    });


});