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
        'altair/plugins/node!fs'
], function (declare,
             _Base,
             hitch,
             Deferred,
             fs) {

    var defaultCallback = function (Class, options) {

        var a = new Class(options);

        return a;
    };

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Foundry',
        execute: function (module) {


            declare.safeMixin(module, {

                foundry: function (className, options, instantiationCallback) {

                    var d = new Deferred(),
                        parent,
                        parts,
                        path;

                    //default callbacks
                    if(!instantiationCallback) {
                        instantiationCallback = defaultCallback;
                    }

                    //if the classname can be resolved in nexus
                    parent = this;

                    if(className.search('::') > 0) {
                        parts       = className.split('::');
                        parent      = this.nexus(parts[0]);
                        className   = parts[1];

                    }

                    path = parent.resolvePath(className + '.js');

                    //nodejs says fs.exists is deprecated, should we just do the require() right out the gate?
                    fs.exists(path, hitch(parent, function (exists) {

                        if(exists) {

                            require([path], hitch(this, function (Child) {

                                var a = instantiationCallback(Child, options);

                                a.name      = this.name + '::' + className;
                                a.module    = this;
                                a._nexus    = this._nexus;

                                declare.safeMixin(a, {
                                   nexus: function (key ,options, config) {
                                       return this._nexus.resolve(key, options, config);
                                   },
                                   on: function() {
                                        return this.module.on.apply(this.module, arguments);
                                   },
                                   emit: function() {
                                        return this.module.emit.apply(this.module, arguments);
                                   }
                                });

                                if(a.startup) {
                                    a.startup(options).then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));
                                } else {
                                    d.resolve(a);
                                }

                            }));

                        } else {
                            d.reject('Could not ' + this.name + '::' + className + ' (' + path + ')');
                        }

                    }));

                    return d;

                }

            });

            return this.inherited(arguments);
        }

    });


});