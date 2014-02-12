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
        'dojo/node!path',
        './_Base'],

    function (declare,
              nodePath,
              _Base) {

    return declare('altair/cartridges/module/plugins/Package', [_Base], {

        execute: function (module) {

            declare.safeMixin(module, {

                /**
                 * Pass a path and it will be appended to this.dir (unless it starts with "/").
                 *
                 * @returns {string}
                 */
                resolvePath: function (path) {

                    if(path[0] === '/') {
                        return path;
                    }

                    return nodePath.join(this.dir, path);
                }

            });

            return this.inherited(arguments);
        }

    });


});