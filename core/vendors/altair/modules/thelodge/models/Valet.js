define(['altair/facades/declare',
    'altair/Lifecycle',
    'altair/facades/mixin',
    'altair/plugins/node!path',
    'lodash'
], function (declare,
             Lifecycle,
             mixin,
             pathUtil,
             _) {

    return declare([Lifecycle], {

        _kitchen: null,
        _npm:     null,
        _tmpDir: '', //where i temporarily save things during install/update

        startup: function (options) {

            var _options = options || this.options || {},
                menus    = _options.menus || this.parent.refreshMenus();

            this.deferred = this.when(menus).then(function (menus) {

                return this.all({
                    _npm:     _options.npm || this.forge('../updaters/Npm'),
                    _kitchen: _options.kitchen || this.forge('../client/Kitchen', {
                        menus: menus
                    })
                });

            }.bind(this)).then(function (deps) {

                this._npm = deps._npm;
                this._kitchen = deps._kitchen;
                return this;


            }.bind(this));


            return this.inherited(arguments);

        },

        /**
         * Loops through all started (and optionanlly not started) modules and installs all altair dependencies
         */
        update: function (options) {

            var _options = options || {},
                allModules = _.has(_options, 'all') ? _options.all : true,
                cartridge = this.nexus('cartridges/Module'),
                modules = cartridge.modules,
                dfd     = new this.Deferred(),
                names = _options.names || '*';

            if(this.nexus('Altair').paths.indexOf('app') === -1) {
                throw new Error('You can only run update on an app.');
            }

            //if we are not doing all modules, then get the names of the installed ones
            if (!allModules && names === '*') {

                names = _.map(modules, function (module) {
                    return module.name;
                });

            }

            this.parent.parseConfig(this.nexus('Altair').resolvePath('package')).then(function (thePackage) {

                return this.fetchDependencies(thePackage, 'app', { invokeNpm: false }).step(this.hitch(dfd, 'progress'));

            }.bind(this)).then(function () {

                return cartridge.buildModules(names, mixin({
                    instantiate: false,
                    skipMissingDependencies: true
                }, options));

            }).then(function (paths) {

                dfd.progress({
                    message: 'found ' + paths.length + ' modules. checking for updates',
                    type: 'notice'
                });

                //read all the packages
                var packages = _.map(paths, function (path) {

                    var packagePath = pathUtil.join(path, '..', 'package.json');
                    return this.parseConfig(packagePath);

                }, this);

                return this.all(packages);

            }.bind(this)).then(function (_packages) {

                var installers = _.compact(_.map(_packages, function (p) {

                    if(p) {

                        return function () {

                            dfd.progress({
                                message: 'checking for updates on ' + p.name,
                                type: 'notice'
                            });

                            return this.fetchDependencies(p, 'app', { invokeNpm: false }).step(this.hitch(dfd, 'progress'));

                        }.bind(this);

                    }

                }, this));

                return this.series(installers);

            }.bind(this)).then(function (results) {

                dfd.progress({
                    message: 'starting npm',
                    type: 'notice'
                });

                return this.npm({ all: true });


            }.bind(this)).then(function () {

                dfd.resolve();

            }).otherwise(this.hitch(dfd, 'reject'));

            return dfd;


        },

        /**
         * Loops through all started (and optionally not started) modules and runs npm update for all of them.
         *
         * @returns {altair.Promise}
         */
        npm: function (options) {

            var _options = options || {},
                invokeNpm = _.has(_options, 'invokeNpm') ? _options.invokeNpm : true,
                allModules = _options.all,
                cartridge = this.nexus('cartridges/Module'),
                modules = cartridge.modules,
                names = _options.names || '*';

            //if we are not doing all modules, then get the names of the installed ones
            if (!allModules && names === '*') {

                names = _.map(modules, function (module) {
                    return module.name;
                });

            }

            //get paths to all modules we want (we have to handle npm before they can be loaded anyway)
            return cartridge.buildModules(names, mixin({
                instantiate: false,
                skipMissingDependencies: true
            }, options)).then(function (paths) {

                //read all the packages
                var packages = _.map(paths, function (path) {

                    //no core modules (really bad check)
                    if(path.search('core/vendors/altair') === -1) {
                        var packagePath = pathUtil.join(path, '..', 'package.json');
                        return this.parseConfig(packagePath);
                    }

                }, this);

                return this.all(packages);

            }.bind(this)).then(function (_packages) {

                var dependencies = _.filter(_.map(_packages, 'dependencies')),
                    devDependencies = _.filter(_.map(_packages, 'devDependencies')),
                    series = [];

                if(devDependencies.length > 0) {
                    series.push(this.hitch(this._npm, 'updateMany', devDependencies, { invokeNpm: false }));
                }

                series.push(this.hitch(this._npm, 'updateMany', dependencies, { invokeNpm: invokeNpm }));

                return this.series(series);

            }.bind(this));

        },

        /**
         * Search the kitchen (and all of its menus) to find a module (or whatevs)
         *
         * @param keywords
         * @returns {altair.Promise}
         */
        search: function (keywords, type) {

            return this._kitchen.search(keywords, type || 'modules');

        },

        /**
         * Install something by name
         *
         * @param name the name of anything in the menu
         * @param version the version you want
         *
         * @returns {altair.Promise}
         */
        install: function (name, destination, version) {

            var menuItem    = this._kitchen.menuItemFor(name),
                dfd         = new this.Deferred();

            if(!menuItem) {
                dfd.reject(new Error('could not install ' + name + ' because i could not find it.'));
            } else {

                dfd = this.parent.createInstaller(menuItem.type, {
                    destination: destination,
                    valet:       this
                }).then(function (installer) {

                    return installer.execute(menuItem.name, version);

                });

            }

            return dfd;

        },

        kitchen: function () {
            return this._kitchen;
        },

        /**
         * Pass me something with both dependencies and altairDependencies and I'll take care of them both
         *
         * @param thePackage an object containing dependencies and altairDependencies (more than likely a parsed package.json)
         * @param destination something like app/home/dev
         * @param options customize everything
         */
        fetchDependencies: function (thePackage, destination, options) {

            var dependencies        = thePackage.dependencies,
                altairDependencies  = thePackage.altairDependencies,
                callbacks           = [],
                invokeNpm           = _.has(options || {}, 'invokeNpm') ? options.invokeNpm : true,
                installer,
                dfd                 = new this.Deferred(),
                installNode         = function () {
                    return this._npm.update(dependencies, options);
                }.bind(this),
                installAltair      = function () {

                    //only the modules installer is supported as of now
                    return this.parent.createInstaller('modules', {
                        destination: destination,
                        valet:       this
                    }).then(function (_installer) {

                        installer = _installer;
                        return installer.execute(altairDependencies);

                    }.bind(this)).then(function (modules) {

                        if(invokeNpm) {

                            return this.npm(_.merge({ all: true }, options)).then(function () {
                                return modules;
                            });
                        } else {
                            return modules;
                        }

                    }.bind(this));


                }.bind(this);


            if(altairDependencies) {
                callbacks.push(installAltair);
            } else if(dependencies && invokeNpm) {
                callbacks.push(installNode);
            }

            this.series(callbacks).then(function (results) {
                dfd.resolve(results.shift()); //take the first (altairDependencies)
            }).step(this.hitch(dfd, 'progress'))
              .otherwise(this.hitch(function (err) {
                dfd.reject(err);
            }));

            return dfd;

        }

    });

});