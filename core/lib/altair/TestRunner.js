/**
 * Our simple test running. Works with doh/runner.
 */
define(['dojo/_base/declare',
    'altair/Lifecycle',
    'dojo/_base/lang',
    'dojo/promise/all',
    'dojo/Deferred',
    'dojo/node!fs',
    'dojo/node!path',
    'doh/runner',
    'altair/wrappers/glob',
    'require'],
    function (declare,
              Lifecycle,
              lang,
              all,
              Deferred,
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

                this.deferred = new Deferred();

                var list         = [];

                options = this.options || options;

                // No tests to run throw error
                if(!options || !options.glob) {
                    this.deferred.reject("You must pass glob option test runner to parse to look for tests.");
                    return;
                }

                doh.debug = console.log;
                doh.error = function (type, message) {
                    console.error(type, message);
                };

                glob(options.glob.map(lang.hitch(require, 'toUrl')), options.globOptions).then(lang.hitch(this, function (files) {
                    list.concat(files.map(lang.hitch(this, 'includeTest')));
                    all(list).then(lang.hitch(this.deferred, 'resolve')).otherwise(lang.hitch(this.deferred, 'reject'));
                })).otherwise(lang.hitch(this.deferred, 'reject'));


                return this.inherited(arguments);

            },

            execute: function () {

                this.deferred = new Deferred();

                doh._onEnd = lang.hitch(this, function () {
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
                var deferred = new Deferred();

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
