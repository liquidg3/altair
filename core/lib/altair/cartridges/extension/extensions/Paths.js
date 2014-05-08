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
                 * @param path
                 * @param options { absolute: true }
                 * @returns {*}
                 */
                resolvePath: function (path, options) {

                    if(!this.dir) {
                        throw new Error('resolvePath for "' + this.name + '" requires this.dir (dirname of absolute path to class file)');
                    }

                    //this is a nexus path
                    if(path.search(':') > 0) {

                        var parts = path.split('/'),
                            module = this.nexus(parts.shift());

                        if(!module) {
                            throw new Error('Could not resolve ' + path);
                        }

                        path = module.resolvePath(parts.join('/'), options);

                    }

                    if(path[0] === '/') {
                        return path;
                    } else if(path[0] === '.' && path[1] === '/') {
                        path = path.slice(2);
                    }


                    //should we return absolute path? is true by default
                    if(!options || !options.absolute) {
                        path = nodePath.join(this.dir || '/', path);
                    }

                    return path;
                }

            });

            return this.inherited(arguments);
        }


    });


});