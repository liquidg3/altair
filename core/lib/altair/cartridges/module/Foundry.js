/**
 * The Foundry is where modules are made. Pass the build() method the options it needs to do its building (see comments
 * above build())
 *
 * Here is how you should structure your modules directory:
 *
 * {{vendorname}}/modules/{{modulename}}/Module.js
 * {{vendorname}}/modules/{{modulename}}/package.json
 *
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/DeferredList',
        'dojo/Deferred',
        'dojo/node!fs',
        'dojo/node!path',
        'require'], function (declare,
                                   lang,
                                   DeferredList,
                                   Deferred,
                                   fs,
                                   path,
                                   require) {


    function ucfirst (str) {
        // From: http://phpjs.org/functions
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: ucfirst('kevin van zonneveld');
        // *     returns 1: 'Kevin van zonneveld'
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
    }


    return declare(null, {



        /**
         * Build modules by looking in paths you pass. The modules that come back will *not* be started up.
         *
         * @param options - {
         *      paths: ['array', 'of', 'dirs', 'to', 'search', 'against']
         * }
         *
         * @returns {dojo.Deferred}
         */
        build: function (options) {

            var list = [];

            //usually the path is called vendors
            options.paths.forEach(lang.hitch(this, function (_path) {
                list.push(this._traverseAndBuildFromVendorsPath(require.toUrl(_path)));
            }));

            var deferredList = new DeferredList(list),
                deferred     = new Deferred();


            deferredList.then(lang.hitch(this, function (results) {

                var modules = [];

                results.forEach(function (result) {
                    result[1].forEach(function (module) {

                        modules.push(module);

                    });
                });

                deferred.resolve(modules);

            }));


            return deferred;

        },

        /**
         * PRIVATE, takes a path and that contains folders that are vendor names.
         *
         * @param vendorsPath
         * @returns {dojo.Deferred}
         * @private
         */
        _traverseAndBuildFromVendorsPath: function (vendorsPath) {

            var list        = [],
                deferred    = new Deferred();

            //inside it should directories named after the vendor
            fs.readdir(vendorsPath, lang.hitch(this, function (err, vendors) {

                if(err) {
                    throw err;
                }

                //each vendor folder has a modules dir which contains an array of modules
                vendors.forEach(lang.hitch(this, function (vendor) {

                    var modulesPath = path.join(vendorsPath, vendor, 'modules');

                    //load modules for this vendor
                    list.push(this._traverseAndBuildFromModulesPath(modulesPath));

                }));

                var deferredList = new DeferredList(list);

                deferredList.then(function (results) {

                    var modules = [];

                    results.forEach(function (result) {
                        result[1].forEach(function (module) {

                            modules.push(module);

                        });
                    });

                    deferred.resolve(modules);

                });

            }));

            return deferred;

        },

        /**
         * PRIVATE
         * @param modulesPath
         * @private
         */
        _traverseAndBuildFromModulesPath: function (modulesPath) {

            var list        = [],
                deferred    = new Deferred();

            fs.readdir(modulesPath, lang.hitch(this, function (err, allModules) {

                if(err) {
                    throw err;
                }

                //here are all the modules, each folder has a js file by the same Name
                allModules.forEach(lang.hitch(this, function (moduleName) {

                    var modulePath = path.join(modulesPath, moduleName, ucfirst(moduleName)) + '.js';
                    list.push(this.buildOne(modulePath));

                }));

                var deferredList = new DeferredList(list);

                deferredList.then(function (results) {

                    var modules = [];

                    results.forEach(function (result) {
                        modules.push(result[1]);
                    });

                    deferred.resolve(modules);

                });


            }));



            return deferred;
        },

        /**
         * Pass full path/to/Module.js and I'll load it up
         * @param path
         */
        buildOne: function (modulePath) {


            var deferred = new Deferred();

            require([modulePath], function (Module) {

                var module      = new Module(),
                    dir         = path.dirname(modulePath),
                    pathParts   = dir.split(path.sep),
                    moduleName  = ucfirst(pathParts.pop()),
                    junk        = pathParts.pop(),
                    vendorName  = ucfirst(pathParts.pop());


                module.dir  = dir;
                module.name = vendorName + ':' + moduleName;

                deferred.resolve(module);

            });

            return deferred;


        }

    });


});