define(['altair/facades/declare',
        'altair/Lifecycle'
], function (declare,
             Lifecycle) {

    "use strict";
    return declare([Lifecycle], {

        clone: function (options) {
            throw new Error('You must implement clone(options)');
        },

        update: function (options) {
            throw new Error('You must implement update(options)');
        },

        status: function (options) {
            throw new Error('You must implement status(options)');
        }

    });

});