define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/events/Emitter',
        'altair/Lifecycle'
], function (declare,
             hitch,
             Emitter,
             Lifecycle) {


    return declare([Emitter, Lifecycle], {

        type: null,

        startup: function (options) {

            var _options = options || this.options;

            if(!_options.type) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('You must pass installers for thelodge a type (such as modules, themes, widgets, etc.)'));
            }

            this.type = _options.type;

            return this.inherited(arguments);
        },

        install: function (from, to) {
            throw new Error('Your installer must implement install(from, to).');
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
        },


        unInstall: function (obj) {
            throw new Error('Your installer must implement unInstall(obj).');
        }



    });

});
