define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/home',
        'altair/Lifecycle',
        'lodash',
        'altair/plugins/node!fs',
        'altair/plugins/node!path',
        'altair/plugins/node!npm'
], function (declare,
             hitch,
             home,
             Lifecycle,
             _,
             fs,
             pathUtil,
             npm) {


    return declare([Lifecycle], {

        _npm: null,

        /**
         * Startup npm
         *
         * @param options
         * @returns {altair.Promise}
         */
        startup: function (options) {

            var _options = options || this.options;

            //do not auto resolve
            this.deferred = new this.Deferred();

            //dependency injection
            this._npm = _options && _options.npm || npm;

            //load npm
            this._npm.load({}, hitch(this, function (err) {

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
         * Update many dependency "groups" at once. I really expect dependencies to be an array of objects where
         * key is the node_module's name and value is the version. I will import them one at a time and see if
         * there are any conflicts between them.
         *
         * @param dependencies
         * @param options
         * @returns {altair.Promise}
         */
        updateMany: function (dependencies, options) {

            var _options        = options || {},
                l,
                devDependencies = _options.dev,
                invokeNpm       = _.has(_options, 'invokeNpm') ? _options.invokeNpm : true,
                mainPackagePath = _options.destination || this.nexus('Altair').resolvePath('package.json');

            //passthrough to copy dependencies
            _options.destination = mainPackagePath;

            //copy over all dependencies one-at-a-time
            return this.series(_.map(dependencies, function (d) {

                return function () {
                    return this.copyDependencies(d, _options);
                }.bind(this);

            }, this)).then(function () {

                if(invokeNpm) {

                    this._npm.prefix = pathUtil.join(mainPackagePath, '..');
                    return this.promise(this._npm, 'update');

                } else {

                    return this;

                }

            }.bind(this)).then(function () {

                this._npm.spinner.stop();

            }.bind(this));


        },

        /**
         * Pass a block of dependencies { "modulename":"version", "modulename": "version" }
         *
         * @param dependencies
         * @param options { invokeNpm: true, ... }
         */
        update: function (dependencies, options) {
            return this.updateMany([dependencies], options);
        },


        /**
         * Pass an array of dependencies (pulled from package.json) and i'll copy them to options.destination. I'll do
         * some semvr checking as well.
         *
         * @param dependencies - the contents of anythings package.json's dependencies
         * @returns {altair.Promise}
         */
        copyDependencies: function (dependencies, options) {

            var results         = new this.Deferred(),
                _options        = options || {},
                dependencyBlock = _options && _options.dev === true ? 'devDependencies' : 'dependencies',
                mainPackagePath = _options.destination || this.nexus('Altair').resolvePath('package.json');

            //we only support dependencies as an object { name: version }
            if(_.isArray(dependencies)) {
                results.reject(new Error('dependencies cannot be an array.'));
            } else {

                //there are some dependencies, lets drop them into package.json
                results = this.parseConfig(mainPackagePath).then(hitch(this, function (mainPackage) {

                    var changesMade = false,
                        results     = mainPackage;

                    if(!mainPackage[dependencyBlock]) {
                        mainPackage[dependencyBlock] = {};
                    }

                    //check to see if there is conflict with mainPackage
                    _.forIn(dependencies, function (version, dep) {

                        //incompatible version found
                        if(false) { //not sure how to get this semantic version comparison to work_.has(mainPackage.dependencies, dep) && !semvr.satisfies(semvr.clean(version), mainPackage.dependencies[dep].version)) {
                            results = new this.Deferred();
                            results.reject(new Error('Package version incompatibility between install and ' + mainPackagePath));
                            return false;
                        }
                        //it's not already in there (so far, in real world uses, always dropping the dependency into the package.json is the best move... even if it means downgrading)
                        else if(true || !_.has(mainPackage[dependencyBlock], dep)) {
                            mainPackage[dependencyBlock][dep] = version;
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
                                results.resolve(mainPackage);

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
