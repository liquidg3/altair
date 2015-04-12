/**
 * Our simple test running. Works with doh/runner.
 */
define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/plugins/node!fs',
        'altair/plugins/node!debug',
        'altair/plugins/node!path',
        'doh/runner',
        'altair/facades/glob',
        'require'],
    function (declare,
              Lifecycle,
              hitch,
              all,
              fs,
              debug,
              path,
              doh,
              glob,
              require) {


        return declare('altair/TestRunner', [Lifecycle], {

            /**
             * @param options
             * options.paths - an array of paths whose contents are assumed to be tests
             *
             * @returns {*}
             */
            startup: function (options) {

                var list         = [],
                    _options = this.options || options;

                // No tests to run throw error
                if(!_options || !_options.glob) {
                    this.deferred.reject("You must pass glob option test runner to parse to look for tests.");
                    return;
                }

                doh.debug = console.log;
                doh.error = function (err) {
                    if(err.stack) {
                        console.error(err.stack || err);
                    } else {
                        console.log(err);
                    }
                };


                doh._handleFailure = function (groupName, fixture, e) {

                    // this.debug("FAILED test:", fixture.name);
                    // mostly borrowed from JUM
                    this._groups[groupName].failures++;
                    if(e instanceof this._AssertFailure){
                        this._failureCount++;
                        this.error(e.toString());
                    }else{
                        this._errorCount++;
                        this.error(e); // printing Error on IE9 (and other browsers?) yields "[Object Error]"
                    }
                    if(fixture.runTest["toSource"]){
                        var ss = fixture.runTest.toSource();
                        this.debug("\tERROR IN:\n\t\t", ss);
                    }else{
                        this.debug("\tERROR IN:\n\t\t", fixture.runTest);
                    }
                    if(e.rhinoException){
                        e.rhinoException.printStackTrace();
                    }else if(e.javaException){
                        e.javaException.printStackTrace();
                    }
                };

                this.deferred = glob(_options.glob.map(function (p) {
                    if (p[0] === '.') {
                        return path.join(process.cwd(), p);
                    } else {
                        return require.toUrl(p);
                    }
                }), _options.globOptions).then(hitch(this, function (files) {

                    list.concat(files.map(hitch(this, 'includeTest')));
                    return all(list);

                })).then(hitch(this, function () {
                    return this;
                }));


                return this.inherited(arguments);
            },

            execute: function () {
                this.deferred = new this.Deferred();

                doh._onEnd = hitch(this, function () {
                    if(doh._errorCount > 0) {
                        this.deferred.reject(doh._errorCount + ' tests failed.');

                    } else {
                        this.deferred.resolve();

                    }

                });

                doh.run();

                return this.inherited(arguments);
            },


            includeTest: function (path) {
                var deferred = new this.Deferred();

                require([path], function (t) {
                    if(!t) {
                        deferred.reject('including ' + path + ' failed');

                    } else {
                        deferred.resolve(t);

                    }
                });

                return deferred;
            }

        });

    });
