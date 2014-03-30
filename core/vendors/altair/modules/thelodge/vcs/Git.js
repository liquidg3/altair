define(['altair/facades/declare',
        'altair/modules/thelodge/vcs/_Base'
], function (declare,
             _Base) {

    "use strict";
    return declare([_Base], {

        checkout: function (options) {
            console.log('options');
        },

        update: function (options) {

        }
    });

});