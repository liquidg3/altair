define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'altair/plugins/node!path',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!fs',
        'altair/plugins/node!npm',
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
             path,
             mkdirp,
             fs,
             npm,
             ncp,
             rimraf,
             semvr,
             require,
             _,
             _IsInstallerMixin) {


    return declare([_IsInstallerMixin], {

        npm: null,
        _steps: [

        ],

        /**
         * Startup npm
         *
         * @param options
         * @returns {altair.Deferred}
         */
        startup: function (options) {

            var _options = options || this.options;

            //do not auto resolve
            this.deferred = new this.Deferred();

            //dependency injection
            this.npm = _options.npm || npm;

            //load npm
            this.npm.load({}, hitch(this, function (err) {

                //doh!
                if(err) {
                    this.deferred.reject(err);
                } else {
                    this.deferred.resolve(this);
                }

            }));

            return this.inherited(arguments);
        },

        /**
         * Try and install a module.
         *
         * @param from the source file path
         * @param to the destination (should most likely be something like app or community)
         * @returns {altair.Deferred}
         */
        install: function (from, to) {

            //some local vars
            var cartridge   = this.nexus('cartridges/Module'), //so we can enable the module after it's copied into place
                foundry     = cartridge.foundry, //the module foundry will help us with path resolution and building modules
                _from       = require.toUrl(from),
                configPath  = path.join(_from, 'package.json'), //path to where the module's package.json should live
                destination, //where we will save it after everything is loaded
                deferred    = new this.Deferred(); //step 1 - let our caller know we intend on being busy

            //step 2 - try and find a package.json for the module to be installed
            this.module.parseConfig(configPath).then(hitch(this, function (package) {

                var list = [];

                //save the destination now that we have the package details
                destination = require.toUrl(path.join(to, foundry.moduleNameToPath(package.name)));

                //deferred.progress();

                //step 3 - check for altairDependencies
                if(package.altairDependencies) {
                    throw new Error('not finished!');
                }

                //step 4 - drop in npm requirements to our projects main package.json if needed
                if(package.dependencies) {

                    list.push(this.installNodeDependencies(package.dependencies).then(function () {
                        //ok, back to what we were doing
                        return package;
                    }));

                } else {
                    list.push(when(package));
                }

                return all(list).then(function () {
                    return package; //make sure next step gets the package
                });

            })).then(hitch(this, function (package) {

                var d = new this.Deferred();

                //step 5 - clean out destination (it may not exist, so this could fail, but no biggy)
                rimraf(destination, function (err) {
                    d.resolve(package);
                });

                return d;

            })).then(hitch(this, function (package) {

                var d           = new this.Deferred();

                //step 6 - create destination directory
                mkdirp(destination, function (err) {

                    if(err) {
                        d.reject(err);
                    } else {
                        d.resolve(package);
                    }

                });

                return d;

            })).then(hitch(this, function (package) {

                //step 7 - move module into place at its destination
                var d = new this.Deferred();

                ncp.ncp(_from, destination, function (err) {
                    if(err) {
                        d.reject(err);
                    } else {
                        d.resolve(package);
                    }
                })

                return d;

            })).then(hitch(this, function (package) {

                //step 8 - pass the module to the foundry for creation
                return foundry.build({
                    paths:      [destination],
                    modules:    [package.name]
                });

            })).then(hitch(this, function (modules) {

                console.log('holy shit really?', modules);

            })).otherwise(hitch(this, function (err) {
                deferred.reject(new Error('Could not install module at ' + from + '. Original error is: ' + err));
            }));


            return deferred;
        },

        /**
         * Install all the node dependencies into altair
         *
         * @param dependencies
         * @returns {altair.Deferred}
         */
        installNodeDependencies: function (dependencies) {

            var results         = new this.Deferred(),
                mainPackagePath = require.toUrl('package.json');

            //we only support dependencies as an object { name: version }
            if(_.isArray(dependencies)) {
                results.reject(new Error('dependencies cannot be an array.'));
            } else {

                //there are some dependencies, lets drop them into package.json
                results = this.module.parseConfig(mainPackagePath).then(hitch(this, function (mainPackage) {

                    var changesMade = false,
                        results     = mainPackage;

                    if(!mainPackage.dependencies) {
                        mainPackage.dependencies = {};
                    }

                    //check to see if there is conflict with mainPackage
                    _.forIn(dependencies, function (version, dep) {

                        //incompatible version found
                        if(false) { //not sure how to get this semantic version comparison to work_.has(mainPackage.dependencies, dep) && !semvr.satisfies(semvr.clean(version), mainPackage.dependencies[dep].version)) {
                            results = new this.Deferred();
                            results.reject(new Error('Package version incompatibility between install and ' + mainPackagePath));
                            return false;
                        }
                        //it's not already in there
                        else if(!_.has(mainPackage.dependencies, dep)) {
                            mainPackage.dependencies[dep] = version;
                            changesMade = true;
                        }

                    }, this);

                    //if we made changes, lets write the /package.json with new dependencies and run npm
                    if(changesMade) {

                        var contents = JSON.stringify(mainPackage, null, 4);
                        results      = new this.Deferred();

                        fs.writeFile(mainPackagePath, contents, hitch(this, function (err) {

                            if(err) {

                                results.reject(err);

                            } else {

                                //run npm update
                                this.npm.commands.update([], function (err, res) {
                                    if(err) {
                                        results.reject(err);
                                    } else {
                                        results.resolve(mainPackage);
                                    }
                                });
                            }

                        }));
                    }

                    return results;

                }));

            }

            return results;
        }

    });

});
