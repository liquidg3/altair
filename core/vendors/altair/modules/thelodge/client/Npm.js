define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/Lifecycle',
        'lodash',
        'altair/plugins/node!fs',
        'altair/plugins/node!npm'
], function (declare,
             hitch,
             Lifecycle,
             lodash,
             fs,
             npm) {


    return declare([Lifecycle], {

        _npm: null,

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
         * Install all the node dependencies into altair
         *
         * @param dependencies
         * @returns {altair.Deferred}
         */
        installDependencies: function (dependencies) {

            var results         = new this.Deferred(),
                mainPackagePath = require.toUrl('package.json');

            //we only support dependencies as an object { name: version }
            if(_.isArray(dependencies)) {
                results.reject(new Error('dependencies cannot be an array.'));
            } else {

                //there are some dependencies, lets drop them into package.json
                results = this.parseConfig(mainPackagePath).then(hitch(this, function (mainPackage) {

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
                                this._npm.commands.update([], function (err, res) {
                                    if(err) {
                                        results.reject(err);
                                    } else {
                                        results.resolve(mainPackage);
                                    }
                                });
                            }

                        }));
                    } else {

                        results = new this.Deferred();

                        //run npm update
                        this._npm.commands.update([], function (err, res) {
                            if(err) {
                                results.reject(err);
                            } else {
                                results.resolve(mainPackage);
                            }
                        });
                    }

                    return results;

                }));

            }

            return results;
        }


    });

});
