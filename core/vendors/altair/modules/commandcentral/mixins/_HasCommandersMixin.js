define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/events/Emitter',
        'altair/facades/all',
        'altair/facades/mixin',
        'lodash'
], function (declare,
             Lifecycle,
             Emitter,
             all,
             mixin,
             _) {


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

                var _commanders = {};

                //resolve relative paths
                _(commanders).each(function (commander, alias) {

                    var name = commander.path,
                        options = mixin(commander, {
                            adapter: this.nexus('altair:CommandCentral').adapter()
                        });

                    if(!name) {
                        throw new Error("You must pass your " + alias + " commander a path");
                    }

                    if(name.search(':') === -1) {
                        name = this.name + '/' + name;
                    }

                    _commanders[alias] = this.forge(name, options);

                },this);

                return all(_commanders);

            }));

        }

    });

});
