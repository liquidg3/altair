/**
 * Our simple test running. Works with doh/runner
 */
define(['dojo/_base/declare',
        'altair/Lifecycle',
        'dojo/_base/lang',
        'dojo/DeferredList',
        'dojo/Deferred',
        'dojo/node!fs',
        'dojo/node!path',
        'doh/runner'],
function (declare, Lifecycle, lang, DeferredList, Deferred, fs, path, doh) {

    return declare([Lifecycle], {

        /**
         * @param options
         * options.paths - an array of paths whose contents are assumed to be tests
         *
         * @returns {*}
         */
        startup: function (options) {

            this.deferred = new Deferred();

            var _defers = [],
                readDeferred = new Deferred();


            options.paths.forEach(lang.hitch(this, function (thisPath, i) {

                fs.lstat(thisPath, lang.hitch(this, function (err, stats) {

                    //if the path is really a directory?
                    if((stats.isDirectory())) {

                        //read all files in the directory (we assume they are all test files)
                        fs.readdir(thisPath, lang.hitch(this, function (err, files) {

                            files.forEach(lang.hitch(this, function (name) {

                                //include the test
                                _defers.push( this.includeTest( path.join(thisPath, name ) ));

                                //we have read and included all files
                                if(i == options.paths.length -1) {
                                    readDeferred.resolve();
                                }

                            }));

                        }));


                    }

                }));


            }));


            doh.debug = console.log;
            doh.error = function (type, message) {
                console.error(type, message);
            };
            readDeferred.then(lang.hitch(this, function () {

                var includeFiles = new DeferredList( _defers );
                    includeFiles.then(lang.hitch(this, function() {

                        this.deferred.resolve(this);

                    }));
            }));


            return this.inherited(arguments);

        },

        execute: function () {

            this.deferred = new Deferred();

            doh._onEnd = lang.hitch(this, function () {
                this.deferred.resolve();
            });

            doh.run();

            return this.inherited(arguments);
        },


        includeTest: function (path) {
            var deferred = new Deferred();

            require([path], function (t) {
                deferred.resolve(t);
            });

            return deferred;

        }

    });
});