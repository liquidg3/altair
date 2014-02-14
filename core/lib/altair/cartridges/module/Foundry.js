/**
 * The Foundry is where modules are made. Pass the build() method the options it needs to do its building (see comments
 * above build())
 *
 * Here is how you should structure your modules directory:
 *
 * {{vendorname}}/modules/{{modulename}}/Module.js
 * {{vendorname}}/modules/{{modulename}}/package.json
 *
 * Altair likes to call the folder "vendors," but it does not need to be
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/facades/hitch',
        'dojo/promise/all',
        'dojo/Deferred',
        'altair/facades/glob',
        'dojo/node!path',
        'require'],
                         function (declare,
                                   lang,
                                   hitch,
                                   all,
                                   Deferred,
                                   glob,
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


    return declare('altair/cartridges/module/Foundry', null, {


        /**
         * Build modules by looking in paths you pass. The modules that come back will *not* be started up.
         *
         * @param options - {
         *      paths:      ['array', 'of', 'dirs', 'to', 'search', 'against'],
         *      modules:    ['array','of','modules','to','instantiate'], //if missing, all modules will be created
         *      loadDependencies: true|false //defaults to true
         * }
         *
         * @returns {dojo.Deferred}
         */
        build: function (options) {

            var deferred        = new Deferred();

            try {

                //they want to restrict the modules being created
                options.modules = (options && options.modules) ? options.modules : '*';

                if(!options.paths || options.paths.length === 0) {
                    deferred.reject("You must pass an array of paths for the Module Foundry to search and parse.");
                    return deferred;
                }

                //take every path we have received and glob them for our module pattern
                var paths = options.paths.map(function (_path) {
                    return path.join(require.toUrl(_path), '*/modules/*/*.js');
                });


                //glob all the dirs
                glob(paths).then(hitch(this, function (files) {

                    paths = this._filterPaths(files, options.modules);

                    //all modules failed?
                    if(!paths || paths.length === 0 || (options.modules != '*' && paths.length != options.modules.length)) {
                        deferred.reject("Failed to load all modules: " + options.modules.join(', '));
                        return;
                    }

                    this._sortByDependencies(paths).then(hitch(this, function (sorted) {

                        //we have our sorted list, lets build each module
                        var list    = sorted.map(hitch(this, 'buildOne'));

                        all(list).then(hitch(deferred, 'resolve')).otherwise(hitch(deferred, 'reject'));

                    })).otherwise(hitch(deferred, 'reject'));


                })).otherwise(hitch(deferred, 'reject'));

            } catch (e) {

                deferred.reject(e);

            }



            return deferred;

        },

        /**
         * Filters all the paths you pass down to only those who match the passed module names
         *
         * @param paths
         * @param moduleNames
         * @private
         */
        _filterPaths: function (paths, moduleNames) {
            if(moduleNames == '*') {
                return paths;
            }

            return paths.filter(hitch(this, function (path) {
                var name = this._pathToModuleName(path);
                return moduleNames.indexOf(name) > -1;
            }));
        },

        /**
         * Will read every module's package.json to read its dependencies, then tries to sort the list accordingly. Currently
         * is stupid, does not handle versions, and only handles altairDepenencies as an object
         *
         * @param paths
         * @private
         */
        _sortByDependencies: function (paths) {

            var list                    = [],
                pathsByName             = {},
                deferred                = new Deferred();

            //build up paths
            paths.forEach(hitch(this, function (_path) {

                var name        = this._pathToModuleName(_path),
                    packagePath = path.resolve(require.toUrl(_path), '../', 'package.json'),
                    module      = {
                        name: name,
                        path: _path,
                        dependencies: null
                    };

                pathsByName[name] = _path;

                //manage our deferreds
                var def = new Deferred();
                list.push(def);

                require(['altair/plugins/config!' + packagePath], hitch(this, function (config) {
                    if(config.altairDependencies) {
                        module.dependencies = Object.keys(config.altairDependencies);
                        module.dependencies.forEach(function (dep) {
                            if(!lang.isString(dep) && !def.isRejected()) {
                                deferred.reject('Make sure your altairDependencies have a version number. Module in question is ' + module.name);
                                return;
                            }
                        });
                    }
                    if(!deferred.isRejected()) {
                        def.resolve(module);
                    }
                }));

            }));

            //make sure they all resolve, flatten the list, then order them by putting unshift()'ing dependent modules
            all(list).then(hitch(this, function (results) {

                var sorted = [];

                results.forEach(hitch(this, function (m) {

                    if(m.dependencies) {
                        m.dependencies.forEach(hitch(this, function (dep) {
                            var p = pathsByName[dep];

                            if(!p) {
                                deferred.reject("Dependent module " + dep + " is missing. Make sure it exists in your 'paths' and is enabled. The module is in question is " + m.name);
                            }

                            if(sorted.indexOf(p) === -1) {
                                sorted.unshift(p);
                            }
                        }));
                    }

                    if(sorted.indexOf(m.path) === -1) {
                        sorted.push(m.path);
                    }

                }));

                deferred.resolve(sorted);

            }));


            return deferred;

        },


        /**
         * Pass the full path to a Module.js and get back its name.
         *
         * @param modulePath
         * @returns {string}
         * @private
         */
        _pathToModuleName: function (modulePath) {

            var dir         = path.resolve(modulePath),
                pathParts   = dir.split(path.sep),
                moduleName  = pathParts.pop().split('.')[0],
                junk        = pathParts.pop(),
                junk2       = pathParts.pop(),
                vendorName  = ucfirst(pathParts.pop());


            return vendorName + ':' + moduleName;
        },

        /**
         * Pass path/to/Module.js and I'll load it up
         *
         * @param path
         */
        buildOne: function (modulePath) {

            var deferred = new Deferred();

            //before any module is required, we have to setup some paths in the AMD loader
            var dir         = path.dirname(modulePath),
                pathParts   = dir.split('/'),
                alias       = pathParts.slice(-3).join(path.sep);


            var paths = {};
            paths[alias] = dir;

            require({
                paths: paths
            });


            require([modulePath], hitch(this, function (Module) {

                var module      = new Module();

                module.dir  = dir;
                module.name = this._pathToModuleName(modulePath);

                deferred.resolve(module);

            }));

            return deferred;


        }

    });


});