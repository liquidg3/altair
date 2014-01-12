define("altair/config", function (dojo) {
    return {
        load: function(id, require, load){
            load(function () {
                return require.nodeRequire(id);
            }());
        },
        normalize: function(id, toAbsMid){

            //@TODO: find the dojo proper way to do this.  It SHOULD? exist?
            var pathElements = id.split('/');

            var packageName = pathElements.shift();
            var packagePath = pathElements.join('/');

            for( var i = 0; i < dojoConfig.packages.length; i++ ){
                var thisPackage = dojoConfig.packages[i];

                if( thisPackage.name == packageName ){
                    packagePath = dojo.baseUrl + thisPackage.location + '/'+packagePath;
                    break;
                }
            }

            //@TODO: We're returning something that isnt very helpful here if the package requested isnt defined.
            return packagePath;
            //return require( packagePath );
//            console.log('normalize', arguments);
//            return id;
        }};
});
