/**
 * Base class for all extensions
 */
define(['altair/facades/declare',
        'altair/mixins/_AssertMixin',
        'altair/Lifecycle',
        'lodash'],

    function (declare,
              _AssertMixin,
              Lifecycle,
              lodash) {

    return declare([Lifecycle, _AssertMixin], {

        cartridge:      null,
        altair:         null,
        name:           false,

        _handles:       '*', //will extend all objects passed to it, examples are ['module', 'widget', 'subComponent']

        constructor: function (cartridge, altair) {

            if(!cartridge) {
                throw new Error('You must pass your extension the Extension cartridge');
            }

            this.cartridge  = cartridge;
            this.altair     = altair || cartridge.altair;

            if(!this.name) {
                throw new Error('You must define a .name for your extension.');
            }
        },

        extend: function (Module) {
            return Module;
        },

        /**
         * Does this extension apply to an object of a particular type
         *
         * @param type string type, can be things like module, widget, webController, subComponent
         * @returns {boolean}
         */
        canExtend: function (type) {
            return this._handles === '*' || type === this._handles ||  _.indexOf(this._handles, type) > -1;
        }

    });


});