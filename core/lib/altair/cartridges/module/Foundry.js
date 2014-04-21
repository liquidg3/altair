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
define(['altair/facades/declare',
        'dojo/_base/lang',
        'altair/facades/hitch',
        'dojo/promise/all',
        'altair/Deferred',
        'altair/facades/glob',
        'altair/plugins/node!path',
        'altair/facades/__',
        'require'],
                         function (declare,
                                   lang,
                                   hitch,
                                   all,
                                   Deferred,
                                   glob,
                                   path,
                                   __,
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
         *      paths:      ['app', 'community', 'local', 'core', 'test', 'etc.'], //i will add {{vendorName}}/modules/{{modulename}} to each path
         *      modules:    ['vendor:ModuleOne','vendor:Module2'], //if missing, all modules will be created
         *      loadDependencies: true|false //defaults to true
         * }
         *
         * @returns {dojo.Deferred}
         */
        build: function (options) {

            var deferred        = new Deferred(),
                paths;

            try {

                //they want to restrict the modules being created
                options.modules = (options && options.modules) ? options.modules : '*';

                if(!options.paths || options.paths.length === 0) {
                    deferred.reject("You must pass an array of paths for the Module Foundry to search and parse.");
                    return deferred;
                }

                //take every path we have received and glob them for our module pattern
                paths = options.paths.map(function (_path) {
                    return path.join(require.toUrl(_path), '*/modules/*/*.js');
                });


                //glob all the dirs
                glob( paths ).then( hitch( this, function ( files ) {

                    var _paths = this._filterPaths( files, options.modules );

                    //all modules failed?
                    if( !_paths || _paths.length === 0 || (options.modules !== '*' && _paths.length !== options.modules.length)) {
                        throw new Error("Failed to load one or more modules: " + options.modules.join(', ') + ' from paths: ' + paths.join(', '));
                    }

                    return this._sortByDependencies(_paths);


                })).then(hitch(this, function (sorted) {

                    if(!sorted) {
                        throw new Error('No modules found to build in Foundry. Checked ' + paths);
                    } else {

                        //we have our sorted list, lets build each module
                        var list    = sorted.map(hitch(this, 'buildOne'));

                        return all(list);

                    }


                })).then(hitch(deferred, 'resolve')).otherwise(hitch(deferred, 'reject'));

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
            if(moduleNames === '*') {
                return paths;
            }

            return paths.filter(hitch(this, function (path) {
                var name = this.pathToModuleName(path);
                return moduleNames.indexOf(name) > -1;
            }));
        },

        /**
         * Will read every module's package.json to read its dependencies, then tries to sort the list accordingly. Currently
         * is stupid, does not handle versions, and only handles altairDepenencies as an object (meaning you must set a
         * version).
         *
         * @param paths
         * @private
         */
        _sortByDependencies: function (paths) {

            var list                    = [],
                pathsByName             = {},
                deferred                = new Deferred(),
                def;

            //build up paths
            paths.forEach(hitch(this, function (_path) {

                var name        = this.pathToModuleName(_path),
                    packagePath = path.resolve(require.toUrl(_path), '../', 'package.json'),
                    module      = {
                        name: name,
                        path: _path,
                        dependencies: null
                    };

                pathsByName[name] = _path;

                //manage our deferreds
                def = new Deferred();
                list.push(def);

                require(['altair/plugins/config!' + packagePath], hitch(this, function (config) {

                    if(!config) {
                        def.reject(__('could not parse config at %s', packagePath));
                        return;
                    }

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
                                deferred.reject("Dependent module " + dep + " is missing. Make sure it exists in your 'paths' and is enabled. The module in question is " + m.name);
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
         */
        pathToModuleName: function (modulePath) {

            var dir         = path.resolve(modulePath),
                pathParts   = dir.split(path.sep),
                moduleName  = pathParts.pop().split('.')[0],
                junk        = pathParts.pop(),
                junk2       = pathParts.pop(),
                vendorName  = pathParts.pop();

            return vendorName + ':' + moduleName;
        },

        /**
         * The inverse of above
         *
         * @param name the name of any module name returned from this.pathToModuleName
         * @returns {string}
         */
        moduleNameToPath: function (name) {

            var parts = name.split(':');

            return path.join(parts[0],'modules', parts[1].toLowerCase());

        },

        /**
         * Pass /absolute/path/to/Module.js and I'll load it up
         *
         * @param path
         */
        buildOne: function (modulePath) {

            var deferred    = new Deferred(),

                //before any module is required, we have to setup some paths in the AMD loader
                dir         = path.dirname(modulePath),
                pathParts   = dir.split('/'),
                alias       = pathParts.slice(-3).join(path.sep),
                name        = this.pathToModuleName(modulePath),
                paths    = {};

            paths[alias] = dir;

            require({
                paths: paths
            });

            require([modulePath], hitch(this, function (Module) {

                var module      = new Module();
                    module.dir  = dir;
                    module.name = name;

                deferred.resolve(module);

            }));

            return deferred;
        }

    });


});