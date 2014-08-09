define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/all',
        'altair/facades/when',
        'lodash',
        '../_Base'],
    function (declare,
              hitch,
              all,
              when,
              _,
              _Base) {


        return declare([_Base], {

            name: 'extension',
            _extensions: null, //has to be an array to maintain order
            _forgedModules: null, //any modules we have observed being forged so we can extend when extension are added late
            startup: function (options) {

                var _options = options || this.options || {},
                    cartridge,
                    listen   = this.hitch(function () {
                        if(this.altair.hasCartridge('module')) {
                            //setup module forging listeners
                            cartridge = this.altair.cartridge('module');
                            cartridge.on('will-forge-module').then(this.hitch('onWillForgeModule'));
                            cartridge.on('did-forge-module').then(this.hitch('onDidForgeModule'));
                        }
                    });

                this._forgedModules = [];

                //load the passed extensions
                if (_options.extensions) {

                    this._extensions = [];

                    this.deferred = this.promise(require, _options.extensions).then(this.hitch(function (extensions) {

                        var list = [];

                        if(!_.isArray(extensions)) {
                            extensions = [extensions];
                        }

                        _.each(extensions, function (Extension) {

                            var extension = new Extension(this);
                            list.push(this.addExtension(extension));

                        }, this);

                        return all(list).then(this.hitch(function () {
                            listen();
                            return this;
                        }));

                    }));


                }
                //if there are no extensions, we are ready
                else {
                    this._extensions = [];
                    listen();
                }

                return this.inherited(arguments);

            },

            /**
             * Gets you the first extension by a particular name
             *
             * @param name
             * @returns {*}
             */
            extension: function (name) {
                return _.find(this._extensions, function (ext) {
                    return ext.name === name;
                });
            },

            /**
             * Pass an extension that has not been started up. Resolves with the started up extension and apply it to
             * any previously forged modules.
             *
             * @param ext
             * @returns {altair.Promise}
             */
            addExtension: function (ext) {

                return ext.startup().then(this.hitch(function (ext) {

                    var list = [];

                    this._extensions.push(ext);


                    _.each(this._forgedModules, function (module) {

                        if(ext.canExtend(module, 'module')) {

                            list.push(when(ext.extend(module.constructor, 'module')).then(this.hitch(function () {
                                return ext.execute(module, 'module');
                            })));


                        }
                    }, this);


                    return all(list).then(function () {
                        return ext;
                    });

                }));

            },

            /**
             * Add a bunch of extensions at once.
             *
             * @param exts
             * @returns {*}
             */
            addExtensions: function (exts) {

                var list = [];

                _.each(exts, function (ext) {
                    list.push(this.addExtension(ext));
                }, this);

                return all(list);

            },

            /**
             *
             * @param name
             * @returns {boolean}
             */
            hasExtension: function (name) {
                return _.find(this._extensions, function (ext) {
                    return ext.name === name;
                });
            },

            /**
             * Tells us whether or not we have all the extensions
             *
             * @param namees
             * @returns {boolean}
             */
            hasExtensions: function (names) {

                var i = 0;

                for( ; i < names.length; i++ ) {
                    if(!this.hasExtension(names[i])) {
                        return false;
                    }
                }

                return true;
            },

            /**
             * Extend the passed AMD module using all the available extensions, make sure the module
             * you are passing is a function, not an instance
             *
             * @param module
             * @returns {altair.Promise}
             */
            extend: function (Module, type) {

                var list = [];

                if(Module.prototype._ignoreExtensions === '*') {
                    return Module;
                }

                _.each(this._extensions, function (extension) {
                    if(extension.canExtend(Module, type)) {
                        list.push(extension.extend(Module, type));
                    }
                },this);

                if(list.length == 0) {
                    return Module;
                }

                return all(list).then(function() {
                    return Module;
                });

            },

            /**
             * Run anything you want on an AMD module after it's been instantiated
             *
             * @returns {altair.Promise}
             */
            execute: function (module, type) {

                if(!module || module._ignoreExtensions === '*') {
                    return this.inherited(arguments);
                }

                var list = [];

                _.each(this._extensions, function (extension) {
                    if(extension.canExtend(module, type)) {
                        list.push(extension.execute(module, type));
                    }
                },this);

                if(list.length == 0) {
                    return when(module);
                }

                return all(list).then(function () {
                    return module;
                });

            },

            /**
             * Whenever a module is about to be forged, extend it.
             *
             * @param e
             * @return {altair.Promise}
             */
            onWillForgeModule: function (e) {
                return this.extend(e.get('Module'), 'module');
            },

            /**
             * When a module is done being forged (but is not started up) mixin more
             *
             * @param e
             * @returns {altair.Promise}
             */
            onDidForgeModule: function (e) {
                this._forgedModules.push(e.get('module'));
                return this.execute(e.get('module'), 'module');
            }


        });

    });