define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/Lifecycle',
        'altair/events/Emitter'
], function (declare,
             hitch,
             Lifecycle,
             Emitter) {


    return declare([Lifecycle, Emitter], {

        startup: function () {

            this.on('altair:TheLodge::register-installers').then(hitch(this, 'registerInstallersForTheLodge'));

            return this.inherited(arguments);
        },

        /**
         * Reads our ./configs/thelodge.json and lets the kitchen know
         *
         * @param e
         * @returns {*|Promise}
         */
        registerInstallersForTheLodge: function (e) {

            return this.parseConfig('configs/thelodge.json').then(hitch(this, function (config) {

                //resolve relative paths
                config.installers.forEach(hitch(this, function (installer) {

                    if(!installer.path) {
                        throw "You must set a path for your installer for thelodge";
                    }

                    if(installer.path.search(':') === -1) {
                        installer.path = this.name + '/' + installer.path;
                    }
                }));

                return config.installers;


            }));

        }

    });

});
