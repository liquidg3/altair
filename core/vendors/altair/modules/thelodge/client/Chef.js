define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/when',
        'altair/facades/all',
        'altair/plugins/node!underscore'
], function (declare,
             Lifecycle,
             when,
             all,
             _) {

    return declare([Lifecycle], {

        fetchMenu: function (menu) {
            throw new Error('fetchMenu not implemented');

        }


    });

});