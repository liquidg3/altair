define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/events/Emitter'
], function (declare,
             Lifecycle,
             Emitter) {


    return declare([Lifecycle, Emitter], {

        startup: function () {

            this.on('altair:CommandCentral::register-commanders').then(this.hitch('registerCommanders'));

            return this.inherited(arguments);
        },

        /**
         * Report back our commanders
         *
         * @param e
         * @returns {*|Promise}
        */
        registerCommanders: function (e) {

            return this.parseConfig('configs/commanders').then(this.hitch(function (commanders) {

                //resolve relative paths
                Object.keys(commanders).forEach(this.hitch(function (alias) {

                    if(!commanders[alias].path) {
                        throw new Error("You must pass your " + alias + " commander a path");
                    }

                    if(commanders[alias].path.search('::') === -1) {
                        commanders[alias].path = this.name + '::' + commanders[alias].path;
                    }
                }));

                return commanders;

            })).otherwise(this.hitch(function (err) {
                this.log(err);
            }));

        }

    });

});
