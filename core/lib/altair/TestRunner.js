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
    'doh/runner',
    'require'],
    function (declare,
              Lifecycle,
              lang,
              DeferredList,
              Deferred,
              fs,
              path,
              doh,
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

                var _defers = [],
                    readDeferred = new Deferred();

                options = this.options || options;

                // No tests to run throw error
                if(!options && !options.paths) {
                    throw "You must pass an array of paths for the test runner to parse to look for tests.";
                }

                //rebuild the paths array if there are any paths with wildcards in them.
                options.paths = this.parsePathWildcards( options.paths );

                options.paths.forEach(lang.hitch(this, function (thisPath, i) {

                    thisPath = require.toUrl(thisPath);

                    fs.lstat(thisPath, lang.hitch(this, function (err, stats) {

                        if(err) {
                            throw err;
                        }

                        //if the path is really a directory?
                        if((stats.isDirectory())) {

                            //read all files in the directory (we assume they are all test files)
                            fs.readdir(thisPath, lang.hitch(this, function (err, files) {

                                files.forEach(lang.hitch(this, function (name) {

                                    //include the test
                                    if(name.search('.js') > 0) {
                                        _defers.push( this.includeTest( path.join(thisPath, name ) ));
                                    }


                                }));

                                //we have read and included all files
                                if(i == options.paths.length -1) {
                                    readDeferred.resolve();
                                }

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

            },

            parsePathWildcards: function( _paths ){

                for( var i = 0; i < _paths.length; i++ ){
                    var _path = _paths[i];

                    var pathParts = _path.split(/\*(.+)?/);


                    if( pathParts.length - 1 ){
                        var basePath = pathParts[0] ? pathParts[0] : '';
                        var trailingPath = pathParts[1] ? pathParts[1] : '';

                        //remove this item from the paths list...
                        var index = _paths.indexOf( _path );

                        if( index > -1 ){
                            //take the old path out, 'cause we know it's not a real path.
                            _paths.splice( index, 1 );

                            //create a new list of paths, substituting the first * with each directory in the folder.
                            if( fs.existsSync( basePath ) && fs.lstatSync( basePath ).isDirectory() ){
                                var fileNames = fs.readdirSync( require.toUrl(basePath) );

                                for( var i = 0; i < fileNames.length; i++ ){

                                    var newBasePath = path.join( basePath, fileNames[i] );

                                    var newPath = path.join( newBasePath, trailingPath );

                                    if( fs.statSync( require.toUrl( newBasePath ) ).isDirectory() ){
                                        //append new path to _paths.
                                        _paths.splice(index,0,newPath);
                                        index++
                                    }

                                }

                                _paths = this.parsePathWildcards( _paths );

                            }

                        }

                    }

                }


                return _paths;

            }



        });

    });
