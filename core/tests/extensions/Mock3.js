/**
 * A plugin for testing, do not use
 */
define(['altair/facades/declare',
    'altair/cartridges/extension/extensions/_Base'], function (declare, _Base) {

    return declare([_Base], {

        _handles: ['subComponent'],
        name: 'mock3',
        extend: function (Module) {

            Module.extendOnce({

                _count: 0,
                foo3: function () {
                    return 'bar3';
                }

            });

            return this.inherited(arguments);
        }

    });


});