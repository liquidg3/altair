define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/plugins/node!path',
    'lodash'
], function (declare, Lifecycle, pathUtil, _) {

    return declare([Lifecycle], {

        _kitchen: null,
        _npm:     null,

        startup: function (options) {

            var _options = options || this.options || {},
                menus    = _options.menus || this.parent.refreshMenus();

            this.deferred = new this.Deferred();

            this.when(menus).then(function (menus) {

                return this.all({
                    _npm:     this.forge('../updaters/Npm'),
                    _kitchen: this.forge('../client/Kitchen', {
                        menus: menus
                    })
                });

            }.bind(this)).then(function (deps) {

                this._npm = deps._npm;
                this._kitchen = deps._kitchen;
                this.deferred.resolve(this);

            }.bind(this)).otherwise(this.hitch(this.deferred, 'reject'));


            return this.inherited(arguments);

        },


        /**
         * Loops through all started (and optionally not started) modules and runs npm update for all of them.
         *
         * @returns {altair.Deferred}
         */
        npm: function (options) {

            var _options = options || {},
                allModules = _options.all,
                cartridge = this.nexus('cartridges/Module'),
                modules = cartridge.modules,
                names = '*';

            //if we are not doing all modules, then get the names of the installed ones
            if (!allModules) {

                names = _.map(modules, function (module) {
                    return module.name;
                });

            }

            //get paths to all modules we want (we have to handle npm before they can be loaded anyway)
            return cartridge.buildModules(names, {
                instantiate: false
            }).then(function (paths) {

                var _paths = _.map(paths, function (path) {
                    return pathUtil.join(path, '..');
                }, this);

                return this._npm.updateMany(_paths);


            }.bind(this));

        },

        /**
         * Search the kitchen (and all of its menus) to find a module (or whatevs)
         *
         * @param keywords
         * @returns {altair.Deferred}
         */
        search: function (keywords, type) {

            return this._kitchen.search(keywords, type || 'modules');

        }



    });

});