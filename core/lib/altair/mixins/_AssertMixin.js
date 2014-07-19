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

        assertFail: function (message) {
            throw new Error(message);
        }

    });

});