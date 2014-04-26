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

                var list = [];

                //resolve relative paths
                Object.keys(commanders).forEach(this.hitch(function (alias) {

                    var name = commanders[alias].path;

                    if(!name) {
                        throw new Error("You must pass your " + alias + " commander a path");
                    }

                    if(name.search('::') === -1) {
                        name = this.name + '::' + name;
                    }

                    list.push(this.foundry(name));

                }));

                return all(list);

            })).otherwise(this.hitch(function (err) {
                this.log(err);
            }));

        }

    });

});
