/**
 * give every module a resolvePath: function that will resolve a path assuming the current working directory is that of
 * the module. Examples
 *
 *      module.resolvePath('configs/listeners.json') -> /path/to/module/configs/listeners.json
 *      module.resolvePath('./configs/listeners.json') -> /path/to/module/configs/listeners.json
 *      module.resolvePath('/configs/listeners.json') -> /configs/listeners.json
 *      module.resolvePath('public/js/Paths.js') -> /path/to/module/public/js/Paths.js
 *
 * This makes it very easy for you to get access to anything inside any particular module's directory.
 */
define(['altair/facades/declare',
        'altair/plugins/node!path',
        './_Base'],

    function (declare,
              nodePath,
              _Base) {

    return declare([_Base], {

        name: 'paths',
        extend: function (Module) {

            Module.extendOnce({

                /**
                 * Pass a path and it will be appended to this.dir (unless it starts with "/").
                 *
                 * @returns {string}
                 */
                resolvePath: function (path) {

                    if(!this.dir) {
                        throw new Error('resolvePath for "' + this.name + '" requires this.dir (absolute path to class)');
                    }

                    if(path[0] === '/') {
                        return path;
                    } else if(path[0] === '.' && path[1] === '/') {
                        path = path.slice(2);
                    }

                    return nodePath.join(this.dir || '/', path);
                }

            });

            return this.inherited(arguments);
        }


    });


});