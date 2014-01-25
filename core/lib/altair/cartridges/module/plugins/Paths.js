/**
 * give every module a resolvePath: function that will resolve a path assuming the current working directory is that of
 * the module. Examples
 *
 *      module.resolvePath('config/listeners.json') -> /path/to/module/config/listeners.json
 *      module.resolvePath('/config/listeners.json') -> /config/listeners.json
 *      module.resolvePath('public/js/Paths.js') -> /path/to/module/public/js/Paths.js
 *
 * This makes it very easy for you to get access to anything inside any particular module's directory.
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        './_Base'], function (declare, Deferred, _Base) {

    return declare('altair/cartridges/module/plugins/Package', [_Base], {

        execute: function (module) {

            this.deferred = new Deferred();

            declare.safeMixin(module, {

                /**
                 * Pass a path and it will be append to this.dir (unless it starts with "/").
                 *
                 * @returns {string}
                 */
                resolvePath: function (path) {

                    //@TODO check against proper directory separator / or \???
                    //most devs will probably just pass /, so we should check both ways, yeah?
                    //lets use path.join here
                    if(path[0] == '/') {
                        return path;
                    }
                    return this.dir + '/' + path;
                }

            });

            this.deferred.resolve(this);

            return this.inherited(arguments);
        }

    });


});