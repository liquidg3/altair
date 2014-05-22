define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'altair/plugins/node!path',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!os',
        'altair/plugins/node!fs',
        'altair/plugins/node!ncp',
        'altair/plugins/node!rimraf',
        'altair/plugins/node!semver',
        'require',
        'lodash',
        '../mixins/_IsInstallerMixin'
], function (declare,
             hitch,
             when,
             all,
             pathUtil,
             mkdirp,
             os,
             fs,
             ncp,
             rimraf,
             semvr,
             require,
             _,
             _IsInstallerMixin) {


    return declare([_IsInstallerMixin], {

        _valet: null,
        _tmpDir: '', //where can i work with temporary files?
        _modulesInstalled: null,
        _destination: '', //where we are installing (core, app, local, defined in ./altair/.altair.json)


        /**
         * Startup npm
         *
         * @param options
         * @returns {altair.Deferred}
         */
        startup: function (options) {

            var _options = options || this.options || {};

            //start in over
            this._tmpDir        = _options.tmpDir || os.tmpdir();
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
         * @param menuItem
         * @returns {thelodge.installers thelodge.installers.mixins._IsInstallerMixin}
         */
        execute: function (name, version) {


            this.deferred = new this.Deferred();

            //new modules being installed
            this._modulesInstalled = {};


            //start by downloading this module and all its dependencies
            this.download(name, version).then(function (modules) {


                this.deferred.progress({
                    message: 'preparing to move ' + modules.length + ' into place',
                    menuItem: this._valet.kitchen().menuItemFor(name)
                });


                //resolve and clean out all destination dirs
                return this.all(_.map(modules, function (module) {

                    var dfd = new this.Deferred(),
                        cartridge   = this.nexus('cartridges/Module'),
                        foundry     = cartridge.foundry;

                    module.destination  = require.toUrl(pathUtil.join(this._destination, foundry.moduleNameToPath(module.name)));

                    rimraf(module.destination, function (err) {
                        dfd.resolve(module);
                    });

                    return dfd;


                }, this));



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
                        message: 'moving ' + module.name + ' to ' + module.destination,
                        menuItem: this._valet.kitchen().menuItemFor(name)
                    });

                    return this.promise(ncp.ncp, module.dir, module.destination).then(function () {
                        return module;
                    });

                }, this));


            })).then(this.hitch(function (modules) {

                this.deferred.progress({
                    message: 'running npm update',
                    menuItem: this._valet.kitchen().menuItemFor(name)
                });

                //npm update on the new stuff
                return this._valet.npm({
                    names: _.map(modules, 'name')
                }).then(function () {
                    return modules;
                });


            })).then(function (modules) {

                this.deferred.progress({
                    message: 'building modules',
                    menuItems: modules,
                    menuItem: this._valet.kitchen().menuItemFor(name)
                });


                return this.build(_.map(modules, 'name'));

            }.bind(this)).then(function (modules) {

                this.deferred.progress({
                    message: 'injecting modules',
                    modules: modules,
                    menuItem: this._valet.kitchen().menuItemFor(name)
                });

                return this.inject(modules);

            }.bind(this)).step(this.hitch(this.deferred, 'progress')).otherwise(this.hitch(this.deferred, 'reject'));


            return this.inherited(arguments);

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
                dfd         = new this.Deferred();

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
                    message: 'starting install for ' + name,
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

                if(version) {
                    options.version         = version;
                }

                //clone the module to be installed
                vcs.clone(options).then(this.hitch(_dfd, 'resolve'), function (err) {

                    throw new Error('cloning ' + name + ' failed: ' + err.message);

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

                 if(package.altairDependencies) {

                     dfd.progress({
                         message: 'installing altair dependencies',
                         menuItem: menuItem
                     });

                     loading.altair = this.all(_.map(package.altairDependencies, function (version, name) {


                         var match = this.nexus(name),
                             dependencyMenuItem;

                         if(match) {

                             dfd.progress({
                                 message: 'skipping ' + name + ', already installed',
                                 menuItem: menuItem
                             });

                         } else {

                             //do we have a menu item for it?
                             dependencyMenuItem = this._valet.kitchen().menuItemFor(name);

                             if(!dependencyMenuItem) {
                                 throw new Error('Could not resolve ' + name + '. Make sure you have it loaded in the kitchen at the lodge.');
                             }

                            return this.download(name, version);


                         }


                     }, this));

                     return this.all(loading);

                 }

            }.bind(this)).then(function () {


                return dfd.resolve(this._modulesInstalled);


            }.bind(this)).otherwise(this.hitch(dfd, 'reject'));

            return dfd;
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

        }


        /**
         * Try and install a module.
         *
         * @param from the source directory, should have a package.json, Module.js, etc.
         * @param to the destination (any resolvable path, like 'app' or 'core', defined in your altair.json)
         * @returns {altair.Deferred} - will resolve with array of live modules
         */
//        install: function (from, to) {
//
//            //some local vars
//            var cartridge   = this.nexus('cartridges/Module'), //so we can enable the module after it's copied into place
//                foundry     = cartridge.foundry, //the module foundry will help us with path resolution and building modules
//                _from       = require.toUrl(from),
//                configPath  = path.join(_from, 'package.json'), //path to where the module's package.json should live
//                destination; //where we will save it after everything is loaded
//
//            //step 2 - try and find a package.json for the module to be installed
//            return this.parseConfig(configPath).then(this.hitch(function (package) {
//
//                var list = [];
//
//                //save the destination now that we have the package details
//                destination = require.toUrl(path.join(to, foundry.moduleNameToPath(package.name)));
//
//                //deferred.progress();
//
//                //step 3 - check for altairDependencies
//                if(package.altairDependencies) {
//                    throw new Error('not finished!');
//                }
//
//                //step 4 - drop in npm requirements to our projects main package.json if needed
//                if(package.dependencies) {
//
//                    list.push(this._npm.installDependencies(package.dependencies));
//
//                } else {
//                    list.push(when(package));
//                }
//
//                return all(list).then(function () {
//                    return package; //make sure next step gets the package
//                });
//
//            })).then(this.hitch(function (package) {
//
//                var d = new this.Deferred();
//
//                //step 5 - clean out destination (it may not exist, so this could fail, but no biggy)
//                rimraf(destination, function (err) {
//                    d.resolve(package);
//                });
//
//                return d;
//
//            })).then(this.hitch(function (package) {
//
//                return this.promise(mkdirp, destination).then(function () {
//                    return package;
//                });
//
//            })).then(this.hitch(function (package) {
//
//                //step 7 - move module into place at its destination
//                return this.promise(ncp.ncp, _from, destination).then(function () {
//                    return package;
//                });
//
//            })).then(this.hitch(function (package) {
//
//                //step 8 - pass the module to the foundry for creation
//                return foundry.build({
//                    paths:      [to],
//                    modules:    [package.name]
//                });
//
//            })).then(this.hitch(function (modules) {
//
//                //step 9 - inject new modules into altair's runtime via the module cartridge
//                return cartridge.injectModules(modules);
//
//            })).then(this.hitch(function (modules) {
//
//                //final step, return the newly activated module
//                return modules;
//
//            })).otherwise(this.hitch(function (err) {
//                this.log(new Error('Could not install module at ' + from + '. Original error is: ' + err));
//            }));
//
//
//        }



    });

});
