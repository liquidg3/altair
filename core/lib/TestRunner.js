/**
 * Runs any tests passed in options.
 */
define(['dojo/_base/declare',
        'altair/Base',
        'dojo/_base/lang',
        'dojo/DeferredList',
        'dojo/Deferred',
        'dojo/node!fs',
        'dojo/node!path'],
function (declare, Base, lang, DeferredList, Deferred, fs, path) {

    return declare([Base], {

        /**
         * @param options
         * options.paths - an array of paths whose contents are assumed to be tests
         *
         * @returns {*}
         */
        startup: function (options) {

            this.deferred = new Deferred;

            var _defers = [];

            for( var i = 0; i < options.paths.length; i++ ){

                var thisPath = path.resolve( options.paths[i] );

                fs.lstat(thisPath, lang.hitch(this, function (err, stats) {

                    //if the path is really a directory?
                    if((stats.isDirectory())) {

                        //read all files in the directory (we assume they are all test files)
                        fs.readdir(thisPath, lang.hitch(this, function (err, files) {

                            files.forEach(lang.hitch(this, function (name) {

                                //include the test
                                _defers.push( this.includeTest( path.join(thisPath, name ) ));

                            }));

                        }));


                    }

                }));
            }


            var includeFiles = new DeferredList( _defers );
                includeFiles.then(lang.hitch(this, function() {

                    doh.debug = console.log;
                    doh.run();

                    this.deferred.resolve(this);

                }));


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