//this is my first package manager, so it is not 100% dependency injection ready
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
         * @param name if string, name of module, if object, assumed to be altairDependences
         * @returns {altair.Promise}
         */
        execute: function (name, version) {

            this.deferred = new this.Deferred();

            //new modules being installed
            this._modulesInstalled = {};

            //build dependencies block, assume if string
            var dependencies = _.isObject(name) ? name : false;

            if(!dependencies) {
                dependencies = {};
                dependencies[name] = version;
            }

            //start by downloading this module and all its dependencies
            this.downloadMany(dependencies).then(function (modules) {

                this.deferred.progress({
                    message: 'preparing to move ' + Object.keys(modules).length + ' modules into place',
                    menuItems: modules
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
                        menuItems: modules
                    });

                    return this.promise(ncp.ncp, module.dir, module.destination).then(function () {
                        return module;
                    });

                }, this));


            })).then(this.hitch(function (modules) {

                this.deferred.progress({
                    message: 'running npm update',
                    menuItems: modules
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
                    menuItems: modules
                });

                return this.build(_.map(modules, 'name'));

            }.bind(this)).then(function (modules) {

                this.deferred.progress({
                    message: 'injecting modules',
                    modules: modules
                });

                return this.inject(modules);

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

                 if(package.altairDependencies) {

                     dfd.progress({
                         message: 'installing altair dependencies',
                         menuItem: menuItem
                     });

                     loading.altair = this.all(_.map(package.altairDependencies, function (version, name) {


                         var match = this.nexus(name),
                             dependencyMenuItem;

                         //@TODO version match check
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
