define(['altair/facades/declare',
        'altair/plugins/node!assert',
        'lodash'
], function (declare,
             assert,
             _) {

    return declare(null, {

        assert: function (thruthy, message) {
            return assert.apply(assert, arguments);
        },

        assertString: function (value, message) {
            return this.assert(_.isString(value), message);
        },

        assertArray: function (value, message) {
            return this.assert(_.isArray(value), message);
        },

        assertNumeric: function (value, message) {
            return this.assert(_.isNumeric(value), message);
        },

        assertFail: function (message) {
            throw new Error(message);
        }

    });

});