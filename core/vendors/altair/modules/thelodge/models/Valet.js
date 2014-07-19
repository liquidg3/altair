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
         * Loops through all started (and optionally not started) modules and runs npm update for all of them.
         *
         * @returns {altair.Promise}
         */
        npm: function (options) {

            var _options = options || {},
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
                instantiate: false
            }, options)).then(function (paths) {

                //read all the packages
                var packages = _.map(paths, function (path) {

                    var packagePath = pathUtil.join(path, '..', 'package.json');
                    return this.parseConfig(packagePath);

                }, this);

                return this.all(packages);

            }.bind(this)).then(function (_packages) {

                var dependencies = _.map(_packages, 'dependencies'),
                    devDependencies = _.map(_packages, 'devDependencies');

                return this.series([
                    function () { this._npm.updateMany(dependencies, { invokeNpm: false });}.bind(this),
                    function () { this._npm.updateMany(devDependencies, { invokeNpm: true, dev: true });}.bind(this)
                ]);

            }.bind(this)).then(function (results) {
//                console.log(results);
            });

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
         * @param package an object containing dependencies and altairDependencies (more than likely a parsed package.json)
         * @param destination
         */
        resolveDependencies: function (package, destination) {


            var dependencies        = package.dependencies,
                altairDependencies  = package.altairDependencies,
                callbacks           = [],
                installer,
                installNode         = function () {
                    return this._npm.update(dependencies);
                }.bind(this),
                installAltair      = function () {

                    //only the modules installer is supported as of now
                    return this.parent.createInstaller('modules', {
                        destination: destination,
                        valet:       this
                    }).then(function (_installer) {

                        installer = _installer;
                        return installer.execute(altairDependencies);

                    }).then(function (modules) {

                        return this.npm({ all: true }).then(function () {
                            return modules;
                        });

                    }.bind(this));


                }.bind(this);


            if(altairDependencies) {
                callbacks.push(installAltair);
            } else if(dependencies) {
                callbacks.push(installNode);
            }

            return this.series(callbacks).then(function (results) {
                return results.shift(); //take the first (altairDependencies)
            });

        }

    });

});