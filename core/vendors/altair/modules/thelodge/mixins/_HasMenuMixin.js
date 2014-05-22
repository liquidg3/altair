define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/events/Emitter'
], function (declare, Lifecycle, Emitter) {


    return declare([Lifecycle, Emitter], {

        startup: function () {

            this.on('altair:TheLodge::register-menu').then(this.hitch('registerMenuForTheLodge'));

            return this.inherited(arguments);
        },

        /**
         * Reads our ./configs/menus.json and lets the for the kitchen
         *
         * @param e
         * @returns {altair.Deferred}
         */
        registerMenuForTheLodge: function (e) {
            return this.parseConfig('configs/menu.json');
        }

    });

});
