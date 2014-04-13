define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'altair/plugins/node!path',
        'altair/plugins/node!mkdirp',
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
             path,
             mkdirp,
             fs,
             ncp,
             rimraf,
             semvr,
             require,
             _,
             _IsInstallerMixin) {


    return declare([_IsInstallerMixin], {

        _npm: null,
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

            if(_options && _options.npm) {
                this._npm = _options.npm;
            } else {

                //do not auto resolve
                this.deferred = new this.Deferred();

                //load npm
                this.module.foundry('client/Npm').then(hitch(this, function (npm) {
                    this._npm = npm;
                    this.deferred.resolve(this);
                }));

            }

            return this.inherited(arguments);
        },

        /**
         * Try and install a module.
         *
         * @param from the source file path
         * @param to the destination (should most likely be something like app or community)
         * @returns {altair.Deferred} - will resolve with array of live modules
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

                    list.push(this._npm.installDependencies(package.dependencies).then(function () {
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
                    paths:      [to],
                    modules:    [package.name]
                });

            })).then(hitch(this, function (modules) {

                //step 9 - inject new modules into altair's runtime via the module cartridge
                return cartridge.injectModules(modules);

            })).then(hitch(this, function (modules) {

                //final step, return the newly activated module
                deferred.resolve(modules);

            })).otherwise(hitch(this, function (err) {
                deferred.reject(new Error('Could not install module at ' + from + '. Original error is: ' + err));
            }));


            return deferred;
        }



    });

});
