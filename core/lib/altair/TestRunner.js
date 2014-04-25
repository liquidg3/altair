/**
 * Our simple test running. Works with doh/runner.
 */
define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/plugins/node!fs',
        'altair/plugins/node!path',
        'doh/runner',
        'altair/facades/glob',
        'require'],
    function (declare,
              Lifecycle,
              hitch,
              all,
              fs,
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
                doh.error = function (type, message) {
                    console.error(type, message);

                };

                this.deferred = glob(_options.glob.map(hitch(require, 'toUrl')), _options.globOptions).then(hitch(this, function (files) {

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
