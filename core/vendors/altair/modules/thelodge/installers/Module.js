//this is my first package manager, so it is not 100% dependency injection ready
define(['altair/facades/declare',
        'altair/plugins/node!path',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!os',
        'altair/plugins/node!ncp',
        'altair/plugins/node!fs',
        'altair/plugins/node!rimraf',
        'altair/plugins/node!semver',
        'require',
        'lodash',
        '../mixins/_IsInstallerMixin'
], function (declare,
             pathUtil,
             mkdirp,
             os,
             ncp,
             fs,
             rimraf,
             semver,
             require,
             _,
             _IsInstallerMixin) {


    return declare([_IsInstallerMixin], {

        _valet: null,
        _tmpDir: '', //where can i work with temporary files?
        _modulesInstalled: null,
        _destination: '', //where we are installing (core, app, local, defined in ./altair/altair.json)


        /**
         * Startup npm
         *
         * @param options
         * @returns {altair.Promise}
         */
        startup: function (options) {

            var _options = options || this.options || {};

            //start in over
            this._tmpDir        = _options.tmpDir || (os.tmpdir || os.tmpDir)();
            this._destination   = _options.destination;
            this._valet         = _options.valet;

            if(!this._destination || !this._valet) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('Installers need a destination and a valet!'));
                return this.inherited(arguments);
            }


            return this.inherited(arguments);
        },

        /**
         * Run all installer logic on this menu item
         *
         * @param name if string, name of module, if object, assumed to be altairDependences
         * @returns {altair.Promise}
         */
        execute: function (name, version) {

            this.deferred = new this.Deferred();

            //new modules being installed
            this._modulesInstalled = {};

            //build dependencies block, assume if string
            var dependencies = _.isObject(name) ? name : false,
                modules;

            if(!dependencies) {
                dependencies = {};
                dependencies[name] = version;
            }

            //start by downloading this module and all its dependencies
            this.downloadMany(dependencies).then(function (_modules) {

                modules = _modules;

                this.deferred.progress({
                    message: 'preparing to move ' + Object.keys(modules).length + ' modules into place',
                    menuItems: modules
                });

                //i need to know all places modules _could_ be installed so i can make sure we don't end up with the same module in 2 spots
                return this.all(_.map(this.nexus('Altair').paths, function (path) {

                    return require.toUrl(path);

                }));

            }.bind(this)).then(function (installPaths) {

                //loop through each module and check if it is installed, where, the version, etc.
                return this.all(_.map(modules, function (module) {

                    var dfd         = new this.Deferred(),
                        cartridge   = this.nexus('cartridges/Module'),
                        foundry     = cartridge.foundry,
                        match       = this.nexus(module.name);

                    //it is not installed, but lets check all our paths anyway (in case we are in safe mode)
                    if(!match) {

                        //loop through all install paths to see if we already have this one
                        _.each(installPaths, function (path) {

                            try {

                                //if we find a match, setup a fake match
                                var p       = require.toUrl(pathUtil.join(path, foundry.moduleNameToPath(module.name), foundry.packageName)),
                                    results = fs.readFileSync(p),
                                    pkg     = JSON.parse(results);

                                match               = pkg;
                                match.dir           = p;
                                match['package']    = pkg;

                            } catch(e) {

                            }

                        });

                    }

                    //is this module already installed?
                    if(match) {

                        //lets make sure this is really an update by doing a version check
                        if(semver.gt(module['package'].version, match['package'].version)) {

                            //now make sure the vcs doesn't detect a change
                            this.deferred.progress({
                                level: 'notice',
                                message: module.name + ' already installed at ' + match.dir + ' with older version, checking for local changes before updating.'
                            });

                            //get vcs adapter
                            this.parent.vcs(module.repository.type).then(function (vcs) {

                                //get status
                                return vcs.status({
                                    destination: match.dir
                                });

                            }).then(function (results) {

                                if(results && results.files && _.toArray(results.files).length
                                    > 0) {
                                    this.log('files modified:', results);
                                    throw new Error('Install halted because ' + match.name + ' at has local changes (I don\'t want to clobber them). Either delete, revert, or commit/push the module at ' + match.dir + '.');
                                }

                                //install new module over old one
                                module.destination = match.dir;

                                dfd.resolve(module);

                            }.bind(this)).otherwise(this.hitch(dfd, 'reject'));

                        }
                        //it is already installed and at the right version, skip it
                        else {

                            this.deferred.progress({
                                level: 'warning',
                                message: module.name + ' skipped because it is currently installed at ' + match.dir + ' with the same or newer version.'
                            });

                            dfd.resolve(false);

                        }


                    } else {

                        //install into selected location
                        module.destination  = require.toUrl(pathUtil.join(this._destination, foundry.moduleNameToPath(module.name)));
                        dfd.resolve(module);

                    }

                    return dfd;

                }, this));



            }.bind(this)).then(function (modules) {

                //clean out array of modules that are being skipped
                modules = _.without(modules, false);

                //clean out all dirs where we are going to install
                return this.all(_.map(modules, function (module) {
                    return this.promise(rimraf, module.destination).then(function () {
                        return module;
                    });
                }.bind(this)));

            }.bind(this)).then(this.hitch(function (modules) {

                //make the destination directories
                return this.all(_.map(modules, function (module) {

                    return this.promise(mkdirp, module.destination).then(function () {
                        return module;
                    });

                }, this));


            })).then(this.hitch(function (modules) {

                //copy modules into place
                return this.all(_.map(modules, function (module) {

                    this.deferred.progress({
                        level: 'notice',
                        message: 'moving ' + module.name + ' to ' + module.destination,
                        menuItems: modules
                    });

                    return this.promise(ncp.ncp, module.dir, module.destination).then(function () {
                        return module;
                    });

                }, this));


            })).then(this.hitch(function (modules) {

                if(modules.length > 0) {

                    this.deferred.progress({
                        level: 'notice',
                        message: 'running npm update',
                        menuItems: modules
                    });

                    //npm update on the new stuff
                    return this._valet.npm({
                        names: _.map(modules, 'name')
                    }).then(function () {
                        return modules;
                    });

                } else {
                    return [];
                }


            })).then(function (modules) {

                var results;

                this.deferred.progress({
                    level: 'notice',
                    message: 'building modules',
                    menuItems: modules
                });

                if(modules.length > 0) {
                    results = this.build(_.map(modules, 'name'));
                } else {
                    results = modules;
                }

                return results;

            }.bind(this)).then(function (modules) {

                if(modules.length > 0) {

                    this.deferred.progress({
                        level: 'notice',
                        message: 'injecting modules',
                        modules: modules
                    });

                    return this.inject(modules);

                } else {

                    this.deferred.progress({
                        level: 'notice',
                        message: 'no modules to inject'
                    });

                    return [];

                }

            }.bind(this))
            .step(this.hitch(this.deferred, 'progress')) //track progress
            .then(this.hitch(this.deferred,'resolve')) //resolve when finished
            .otherwise(this.hitch(this.deferred, 'reject')); //reject on any error


            return this.inherited(arguments);

        },

        /**
         * Pass me an object where the values are an object where name is the altair module and value is the version
         * Matches what is in package.json
         *
         * @param altairDependencies
         * @returns {altair.Promise}
         */
        downloadMany: function (altairDependencies) {

            var dfd = new this.Deferred();

            this.series(_.map(altairDependencies, function (version, name) {
                return function () {
                    return this.download(name, version).step(this.hitch(dfd, 'progress'));
                }.bind(this);
            }.bind(this))).then(function () {
                dfd.resolve(this._modulesInstalled);
            }.bind(this));

            return dfd.promise;

        },

        /**
         * Download module into tmpDir
         *
         * @param name
         * @param version
         * @returns {*}
         */
        download: function (name, version) {

            var menuItem    = _.clone(this._valet.kitchen().menuItemFor(name)), //this can be called recursively so we need to lookup menu items from the kitchen for each thing to be installed
                tmpDir      = pathUtil.join(this._tmpDir, name.replace(':', '-').toLowerCase()),
                configPath  = pathUtil.join(tmpDir, 'package.json'),
                dfd         = new this.Deferred(),
                ver         = version || 'master';

            if(!menuItem) {
                throw new Error('Could not find ' + name + ' in any menu in the kitchen at the lodge.');
            }

            //if we have already installed this guy, don't do it again
            if(this._modulesInstalled[name]) {
                return this.when(this._modulesInstalled[name]);
            }

            //so we can see where this module is sitting for now
            menuItem.dir = tmpDir;

            //track where this module is going (will be used in for the final install)
            this._modulesInstalled[name] = menuItem;

            //create tmp dir for clone
            this._createTmpDir(tmpDir).then(function () {

                dfd.progress({
                    message: 'starting install for ' + name + ' @' + ver,
                    menuItem: menuItem,
                    type: menuItem.repository.type
                });

                return this.parent.vcs(menuItem.repository.type);

            }.bind(this)).then(function (vcs) {


                dfd.progress({
                    message: 'cloning repository at ' + menuItem.repository.url + ' to ' + tmpDir,
                    menuItem: menuItem,
                    url: menuItem.repository.url
                });

                var options             = _.clone(menuItem.repository),
                    _dfd                = new this.Deferred();

                options.destination     = tmpDir;
                options.clean           = true; //so .git folders are removed

                if(version) {
                    options.version         = version;
                }

                //clone the module to be installed, pass progress to main deferred
                vcs.clone(options).step(this.hitch(dfd, 'progress')).then(this.hitch(_dfd, 'resolve'), function (err) {

                    dfd.reject(new Error('cloning ' + name + ' failed: ' + err.message));

                });

                return _dfd;

            }.bind(this)).then(function (path) {

                dfd.progress({
                    message: 'parsing package.json',
                    menuItem: menuItem
                });

                return this.parseConfig(configPath);

            }.bind(this)).then(function (package) {

                var loading = {};

                //drop in the parsed package to the menu item
                menuItem.package = package;

                 if(package.altairDependencies) {

                     dfd.progress({
                         message: 'installing altair dependencies',
                         menuItem: menuItem
                     });

                     loading.altair = this.all(_.map(package.altairDependencies, function (version, name) {

                         var dependencyMenuItem;

                         //skip core modules
                         if(name.search('altair:') === 0) {

                             dfd.progress({
                                 message: 'skipping core module dependency: ' + name,
                                 menuItem: menuItem
                             });

                         } else {

                             //do we have a menu item for it?
                             dependencyMenuItem = this._valet.kitchen().menuItemFor(name);

                             if(!dependencyMenuItem) {
                                 throw new Error('Could not resolve ' + name + '. Make sure you have it loaded in the kitchen at the lodge.');
                             }


                            return this.download(name, version).step(this.hitch(dfd, 'progress'));

                         }


                     }, this));

                     return this.all(loading);

                 }

            }.bind(this)).then(function () {


                return dfd.resolve(this._modulesInstalled);


            }.bind(this)).otherwise(this.hitch(dfd, 'reject'));

            return dfd.promise;
        },


        _createTmpDir: function (tmpDir) {

            return this.promise(rimraf, tmpDir).then(function () {

                return this.promise(mkdirp, tmpDir || this._tmpDir);

            }.bind(this));
        },

        build: function (moduleNames) {

            var cartridge   = this.nexus('cartridges/Module');

            return cartridge.buildModules(moduleNames);

        },

        inject: function (modules) {

            var cartridge   = this.nexus('cartridges/Module');

            //if it as already running, tear it down and then inject it again
            return this.all(_.map(modules, function (module) {

                var match  = this.nexus(module.name),
                    dfd    = module

                if(match) {
                    match.teardown();
                }

                return dfd;

            }, this)).then(function () {

                return cartridge.injectModules(modules);

            }.bind(this));

        },

        installedModules: function () {
            return this._modulesInstalled;
        }

    });

});
