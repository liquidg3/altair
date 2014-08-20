/**
 * The foundry plugin gives each module a foundry(className) method that instantiates a class
 * relative to our module.dir, sets name and module, and optionally calls startup on it.
 *
 * Or, you can pass your own instantiationCallback to do something of your own to instance
 *
 * Example from inside your module
 *
 * this.forge('adapters/Smtp', {...options...}).then(function (smtp)) {
 *
 *      console.log(smtp.name) --> Vendor:Module::adapters/Smtp
 *      console.log(smtp.module) --> instance of Vendor:Module
 *
 * });
 *
 *
 */
define(['altair/facades/declare',
        './_Base',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/Deferred',
        'altair/plugins/node!fs',
        'altair/plugins/node!path',
        'lodash'
], function (declare,
             _Base,
             hitch,
             when,
             Deferred,
             fs,
             pathUtil,
             _) {

    //instantiation callback for every foundry call, assums everything is a subcomponent
    var defaultFoundry = function (Class, options, config) {

        var shouldExtend = !Class._ignoreExtensions || Class._ignoreExtensions !== '*';

        if(shouldExtend) {
            config.extensions.extend(Class, config.type);
        }

        var a       = new Class(options),
            parent  = config.parent,
            dir     = config.dir,
            nexus   = config.nexus,
            name    = config.name || '__unnamed';

        //setup basics if they are missing
        if(!a.name) {
            a.name = name;
        }
        a.name      = a.name || name;
        a.parent    = a.parent || parent;
        a.dir       = a.dir || dir;
        a._nexus    = a._nexus || nexus;

        if(shouldExtend) {
            config.extensions.execute(a, config.type);
        }


        return a;


    },
    cachedExists = function (path, cb) { cb(true);},
    cachedRequire = function (paths, cb, parent) {
        cb(parent._classCache[paths[0]]);
    };

    return declare([_Base], {

        name: 'foundry',
        startup: function () {

            if(!this.cartridge.hasExtension('paths')) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error("The foundry extension needs the paths extension loaded first."));
            } else if(!this.cartridge.hasExtension('nexus')) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error("The foundry extension needs the paths extension loaded first."));
            }

            return this.inherited(arguments);

        },

        extend: function (Module) {

            //save hitched promise function for later
            var promise = this.hitch('promise'),
                extension = this;

            //mixin our extensions
            Module.extendOnce({

                _fileExistsCache: {},
                _classCache: {},
                forgeSync: function (className, options, config) {

                    config = config || {};

                    var parent        = this.parent || this,
                        path,
                        parts,
                        name          = _.has(config, 'name') ? config.name : null,
                        foundry       = _.has(config, 'foundry') ? config.foundry : defaultFoundry,
                        shouldStartup = _.has(config, 'startup') ? config.startup : true,
                        Class,
                        instanceParent = _.has(config, 'parent') ? config.parent : parent,
                        instance,
                        type          = _.has(config, 'type') ? config.type : 'subComponent';

                    if (className.search(':') > 0) {

                        parts       = className.split('/');
                        parent      = this.nexus(parts[0]);
                        className   = className.replace(parts[0] + '/', '');

                        return parent.forgeSync(className, options, config);
                    }

                    if(!name) {

                        if(!parent) {
                            throw new Error('Could not resolve parent for ' + className + ' in Foundry extension. Parent is required if you do not pass a name.');
                        }

                        name = className;

                        //the path is relative to parent, lets try and resolve it
                        //this is safe to change, just make sure to test alfred and controllers
                        if(name.search(/\.\./) > -1) {
                            name = pathUtil.join(this.dir, name).replace(parent.dir, '');
                            name = this.parent.name + '/' + name;
                        } else {
                            name = (name[0] === '/') ? name : parent.name + '/' + name; //keep absolute path?
                        }

                    }

                    //path from newly resolved classname
                    path = this.resolvePath(className + '.js');

                    if( this._classCache[path] ) {
                        Class = this._classCache[path];
                    } else {
                        require([path], function (C) {
                            Class = C;
                        });
                    }

                    instance = foundry(Class, options, {
                        parent:         instanceParent,
                        name:           name,
                        nexus:          instanceParent ? instanceParent._nexus : this._nexus,
                        type:           type,
                        dir:            pathUtil.join(pathUtil.dirname(path), '/'),
                        defaultFoundry: defaultFoundry,
                        extensions:     this.nexus('cartridges/Extension')
                    });

                    if(instance.startup && shouldStartup) {
                        instance.startup(options);
                    }


                    return instance;

                },
                forge: function (className, options, config) {

                    config = config || {};

                    var dfd           = new Deferred(),
                        parent        = this.parent || this,
                        path,
                        exists,
                        parts,
                        _require,
                        name          = _.has(config, 'name') ? config.name : null,
                        foundry       = _.has(config, 'foundry') ? config.foundry : defaultFoundry,
                        shouldStartup = _.has(config, 'startup') ? config.startup : true,
                        type          = _.has(config, 'type') ? config.type : 'subComponent';


                    //are we pointing to a relative directiory?
                    if(className[0] === '.') {
//                        className = pathUtil.join(this.dir, className).replace(parent.dir, '');
                    }
                    //it's a full nexus path
                    else if(className.search(':') > 0) {

                        parts       = className.split('/');
                        parent      = this.nexus(parts[0]);
                        className   = className.replace(parts[0] + '/', '');

                        return parent.forge(className, options, config);
                    }

                    //detect name
                    if(!name) {

                        if(!parent) {
                            dfd.reject('Could not resolve parent for ' + className + ' in Foundry extension. Parent is required if you do not pass a name.');
                            return dfd;
                        }

                        name = className;

                        //the path is relative to parent, lets try and resolve it
                        //this is safe to change, just make sure to test alfred and controllers
                        if(name.search(/\.\./) > -1) {
                            name = pathUtil.join(this.dir, name).replace(parent.dir, '');
//                            name = parent.name.split(':')[0] + ':' + pathUtil.join(parent.name.split(':')[1], '..', name);
                            name = this.parent.name + '/' + name;
                        } else {
                            name = (name[0] === '/') ? name : parent.name + '/' + name; //keep absolute path?
                        }

                    }

                    //path from newly resolved classname
                    path = this.resolvePath(className + '.js');

                    //if the file exists, immediately call the callback with true
                    if(this._fileExistsCache[path]) {
                        exists = cachedExists;
                        _require = cachedRequire;

                    }
                    //otherwise use the actual fs.exists method
                    else {
                        exists = fs.exists.bind(fs);
                        _require = require;
                    }

                    //does this file exist? you have to do this with require() because it will error and never resolve the deferred (done differently in forgeSync
                    exists(path, hitch(this, function (exists) {

                        this._fileExistsCache[path] = exists;

                        if(!exists) {
                            dfd.reject(new Error('Could not create ' + type + ' because I could not find it at:' + path));
                        } else {

                            _require([path], hitch(this, function (Child) {

                                try {

                                    //cache this child
                                    this._classCache[path] = Child;

                                    var p               =  _.has(config, 'parent') ? config.parent : parent,
                                        done            = hitch(this, function (a) {

                                            //startup the module
                                            if(a.startup && shouldStartup) {

                                                var _dfd = a.startup(options);

                                                extension.assert(_dfd && _dfd.then, 'startup() in ' + name + ' does not return a deferred.');

                                                _dfd.then(hitch(dfd, 'resolve')).otherwise(hitch(dfd, 'reject'));

                                            } else {
                                                dfd.resolve(a);
                                            }

                                        }),
                                        a               = foundry(Child, options, {
                                        parent:         p,
                                        name:           name,
                                        nexus:          p ? p._nexus : this._nexus,
                                        type:           type,
                                        dir:            pathUtil.join(pathUtil.dirname(path), '/'),
                                        defaultFoundry: defaultFoundry,
                                        extensions:     this.nexus('cartridges/Extension')
                                    });

                                    if(a.then) {
                                        when(a).then(done).otherwise(hitch(dfd, 'reject'));
                                    } else {
                                        done(a);
                                    }


                                } catch(err) {
                                    dfd.reject(err);
                                }

                            }), this);


                        }

                    }));

                    return dfd;

                }

            });

            return this.inherited(arguments);
        }

    });


});