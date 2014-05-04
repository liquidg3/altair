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
                this.module.forge('client/Npm').then(this.hitch(function (npm) {
                    this._npm = npm;
                    this.deferred.resolve(this);
                }));

            }

            return this.inherited(arguments);
        },

        /**
         * Try and install a module.
         *
         * @param from the source directory
         * @param to the destination (should most likely be something like app or community)
         * @returns {altair.Deferred} - will resolve with array of live modules
         */
        install: function (from, to) {

            //some local vars
            var cartridge   = this.nexus('cartridges/Module'), //so we can enable the module after it's copied into place
                foundry     = cartridge.foundry, //the module foundry will help us with path resolution and building modules
                _from       = require.toUrl(from),
                configPath  = path.join(_from, 'package.json'), //path to where the module's package.json should live
                destination; //where we will save it after everything is loaded

            //step 2 - try and find a package.json for the module to be installed
            return this.module.parseConfig(configPath).then(this.hitch(function (package) {

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

                    list.push(this._npm.installDependencies(package.dependencies));

                } else {
                    list.push(when(package));
                }

                return all(list).then(function () {
                    return package; //make sure next step gets the package
                });

            })).then(this.hitch(function (package) {

                var d = new this.Deferred();

                //step 5 - clean out destination (it may not exist, so this could fail, but no biggy)
                rimraf(destination, function (err) {
                    d.resolve(package);
                });

                return d;

            })).then(this.hitch(function (package) {

                return this.promise(mkdirp, destination).then(function () {
                    return package;
                });

            })).then(this.hitch(function (package) {

                //step 7 - move module into place at its destination
                return this.promise(ncp.ncp, _from, destination).then(function () {
                    return package;
                });

            })).then(this.hitch(function (package) {

                //step 8 - pass the module to the foundry for creation
                return foundry.build({
                    paths:      [to],
                    modules:    [package.name]
                });

            })).then(this.hitch(function (modules) {

                //step 9 - inject new modules into altair's runtime via the module cartridge
                return cartridge.injectModules(modules);

            })).then(this.hitch(function (modules) {

                //final step, return the newly activated module
                return modules;

            })).otherwise(this.hitch(function (err) {
                this.log(new Error('Could not install module at ' + from + '. Original error is: ' + err));
            }));


        }



    });

});
