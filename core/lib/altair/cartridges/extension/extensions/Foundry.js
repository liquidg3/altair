/**
 * The foundry plugin gives each module a foundry(className) method that instantiates a class
 * relative to our module.dir, sets name and module, and optionally calls startup on it.
 *
 * Or, you can pass your own instantiationCallback to do something of your own to instance
 *
 * Example from inside your module
 *
 * this.foundry('adapters/Smtp', {...options...}).then(function (smtp)) {
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
        'altair/Deferred',
        'apollo/_HasSchemaMixin',
        'apollo/Schema',
        'altair/plugins/node!fs',
        'altair/plugins/node!path'
], function (declare,
             _Base,
             hitch,
             Deferred,
             _HasSchemaMixin,
             Schema,
             fs,
             pathUtil) {

    var defaultCallback = function (Class, options) {

        var a = new Class(options);

        return a;

    };

    return declare([_Base], {

        name: 'foundry',
        execute: function (module) {

            //mixin our extensions
            declare.safeMixin(module, {

                foundry: function (className, options, instantiationCallback, shouldStartup) {

                    var d = new Deferred(),
                        parent,
                        parts,
                        path;

                    //should we startup?
                    shouldStartup = instantiationCallback !== false && shouldStartup !== false;

                    //default callbacks
                    if(!instantiationCallback) {
                        instantiationCallback = defaultCallback;
                    } else {

                    }

                    //if the classname can be resolved in nexus
                    parent = this;

                    if(className.search('::') > 0) {
                        parts       = className.split('::');
                        parent      = this.nexus(parts[0]);
                        className   = parts[1];

                    }

                    //the path to the class
                    path = parent.resolvePath(className + '.js');

                    //does this file exist?
                    fs.exists(path, hitch(this, function (exists) {

                        if(!exists) {
                            d.reject(new Error('Could not create ' + path));
                        } else {

                            require([path], hitch(this, function (Child) {

                                var a       = instantiationCallback(Child, options);

                                if(!a) {
                                    d.reject(new Error('The instantiateCallback param in the Foundry extension must return an class instance.'));
                                    return;
                                }

                                //setup basics if they are missing
                                if(!a.name) {
                                    a.name      = className[0] === '/' ? className : parent.name + '/' + className;
                                }

                                a.module    = parent.module || parent;
                                a.dir       = pathUtil.dirname(path);
                                a._nexus    = parent._nexus;

                                //extend this object
                                this.nexus('cartridges/Extension').extend(a).then(hitch(this, function () {

                                    //startup the module
                                    if(a.startup && shouldStartup) {
                                        a.startup(options).then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));
                                    } else {
                                        d.resolve(a);
                                    }

                                }));


                            }));

                        }


                    }));


                    return d;

                }

            });

            return this.inherited(arguments);
        }

    });


});