define(['altair/facades/declare',
        'altair/Lifecycle'
], function (declare,
             Lifecycle) {

    "use strict";
    return declare([Lifecycle], {

        checkout: function (options) {
            throw new Error('You must implement checkout(options)');
        },

        update: function (options) {
            throw new Error('You must implement update(options)');
        }
    });

});