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

                if( fs.lstatSync( thisPath ).isDirectory() ){
                    var files = fs.readdirSync(thisPath);

                    for( var i = 0; i < files.length; i++ ){
                        var thisFilePath = files[i];

                        if( fs.existsSync( thisFilePath ) && thisFilePath.slice(-3) == '.js' ){
                            _defers.push( this.includeTest( thisFilePath ) );
                        }

                    }

                }

            }


            var includeFiles = new DeferredList( _defers );
                includeFiles.then(lang.hitch(this, function() {
                    this.deferred.resolve(this);
                }));


        },


        includeTest: function (path) {
            var deferred = new Deferred();

            require(path, function (t) {
                deferred.resolve(t);
            });

            return deferred;

        }

    });
});