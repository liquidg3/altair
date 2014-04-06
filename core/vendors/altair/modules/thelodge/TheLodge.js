define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/facades/mixin',
        '../events/mixins/_HasEventsMixin',
        '../commandcentral/mixins/_HasCommandersMixin',
        './mixins/_HasInstallersMixin',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!underscore'
], function (declare,
             hitch,
             all,
             mixin,
             _HasEventsMixin,
             _HasCommandersMixin,
             _HasInstallersMixin,
             str,
             _) {

    return declare([_HasEventsMixin, _HasCommandersMixin, _HasInstallersMixin], {

        _installers: null,

        /**
         * Choose a version control strategy (look inside vcs for an avaible startegies)
         *
         * @param type
         * @param options
         * @returns {*}
         */
        vcs: function (type, options) {

            if(type.search('/') === -1) {
                type = 'vcs/' + str.capitalize(type);
            }

            return this.foundry(type, options);

        },

        /**
         * On execute, refresh our installers so we have them available jic.
         *
         * @returns {altair.Deferred}
         */
        execute: function () {
            return this.refreshInstallers().then(hitch(this, function () {
                return this;
            }));
        },

        /**
         * Give every module a chance to register special installers they have registered.
         *
         * @returns {altair.Deferred}
         */
        refreshInstallers: function () {

            return this.emit('register-installers').then(hitch(this, function (installers) {

                //reset our local installers
                this._installers = {};

                //track list of installers
                var list = [];

                installers = _.flatten(installers);

                installers.forEach(hitch(this, function (installer) {

                    var i       = mixin({}, installer),
                        path    = i.path;

                    delete i.path;

                    list.push(this.foundry(path, i));


                }));

                //wait 'till all installers are constructed
                return all(list);

            })).then(hitch(this, function (installers) {

                //set type as key
                installers.forEach(hitch(this, function (installer) {
                    this._installers[installer.type] = installer;
                }));

                return this._installers;

            }));

        }


    });
});