define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/facades/mixin',
        '../events/mixins/_HasEventsMixin',
        '../events/mixins/_HasListenersMixin',
        '../commandcentral/mixins/_HasCommandersMixin',
        './mixins/_HasInstallersMixin',
        './mixins/_HasMenuMixin',
        'lodash'
], function (declare,
             hitch,
             all,
             mixin,
             _HasEventsMixin,
             _HasListenersMixin,
             _HasCommandersMixin,
             _HasInstallersMixin,
             _HasMenuMixin,
             _) {

    return declare([_HasEventsMixin, _HasCommandersMixin, _HasInstallersMixin, _HasListenersMixin, _HasMenuMixin], {

        _installers: null,

        /**
         * Choose a version control strategy (look inside vcs for an available strategies)
         *
         * @param type
         * @param options
         * @returns {*}
         */
        vcs: function (type, options) {

            if(type.search('/') === -1) {
                type = 'vcs/' + _.capitalize(type);
            }

            return this.forge(type, options);

        },

        /**
         * Returns an installer by a particular type. Make sure you call this.refreshInstallers to get the latest list.
         *
         * @param type modules, themes, etc.
         * @returns {*} the installer
         */
        installer: function (type) {
            return this._installers[type];
        },


        /**
         * Refresh all menus registered in the system. Each listener is expected to return an array of menus (see
         * this.registerMenus)
         *
         * @returns {altair.Promise}
         */
        refreshMenus: function () {

            return this.emit('register-menu').then(hitch(this, function (e) {
                return e.results();
            }));

        },

        /**
         * Give every module a chance to register special installers they have registered.
         *
         * @returns {altair.Promise}
         */
        refreshInstallers: function () {

            return this.emit('register-installers').then(hitch(this, function (e) {

                //reset our local installers
                this._installers = {};

                //track list of installers
                var list = [],
                    installers = e.results();

                    //populate local _installers, key is the type (modules, themes, widgets)
                installers.forEach(hitch(this, function (installer) {
                    this._installers[installer.type] = installer;
                }));

                return this._installers;

            }));

        },


        createInstaller: function (type, options) {

            if(!_.has(this._installers, type)) {
                var dfd = new this.Deferred();
                dfd.reject(new Error('could not create installer for '+ type));
                return dfd;
            }

            var installer = this._installers[type].path,
                _options = mixin(this._installers[type], options);

            return this.forge(installer, _options);

        }


    });
});