define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'lodash'
], function (declare,
             Lifecycle,
             hitch,
             when,
             all,
             _) {

    return declare([Lifecycle], {

        _kitchen: null,


        startup: function () {



            return this.inherited(arguments);

        },


        /**
         * Checks all running modules (not in core) and updates the project's package.json with all their (node)
         * dependencies
         *
         * @returns {altair.Deferred}
         */
        npm: function () {

            var d = new this.Deferred();


            return d;

        }


    });

});