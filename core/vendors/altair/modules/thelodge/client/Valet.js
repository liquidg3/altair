define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'altair/facades/mixin',
        'altair/facades/__',
        'lodash'
], function (declare,
             Lifecycle,
             hitch,
             when,
             all,
             mixin,
             __,
             _) {

    return declare([Lifecycle], {

        _kitchen: null,
        _npm:     null,

        startup: function (options) {

            var _options = options || this.options,
                list     = [];

            list.push(this.module.foundry('client/Npm').then(hitch(this, function (npm) {
                this._npm = npm;
            })));

            this.deferred = new this.Deferred();
            all(list).then(hitch(this.deferred, 'resolve', this)).otherwise(hitch(this.deferred, 'reject'));

            return this.inherited(arguments);

        },


        /**
         * Checks all running modules (not in core) and updates the project's package.json with all their node
         * dependencies. This allows people to put "dependencies" in their Altair module's package.json.
         *
         * @returns {altair.Deferred}
         */
        npm: function () {

            var d           = new this.Deferred(),
                cartridge   = this.nexus('cartridges/Module'),
                modules     = cartridge.modules;

            //so progress events are picked up
            setTimeout(hitch(this, function () {

                var dependencies = {};

                _.each(modules, function (m) {

                    //do not include core modules for now (cheap check)
                    if(m.dir.search('/core/vendors') === -1) {

                        d.progress({
                            step:  'pulling-module-dependencies',
                            message: __('checking %s dependencies', m.name)
                        });

                        if(m.package.dependencies) {
                            dependencies = mixin(dependencies, m.package.dependencies);
                        }

                    } else {

                        d.progress({
                            step:  'pulling-module-dependencies',
                            message: __('skipping core module %s', m.name)
                        });

                    }

                });

                d.progress({
                    step:       'dependencies-pulled',
                    data:       dependencies,
                    message:    __('found %d dependencies', Object.keys(dependencies).length)
                });

                //for now, we'll handle npm dependencies using modules installer
                this._npm.installDependencies(dependencies).then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));

            }), 0);



            return d;

        },



    });

});