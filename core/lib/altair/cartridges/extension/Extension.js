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

                //load the passed extensions
                if (_options.extensions) {

                    this._extensions = [];

                    this.deferred = this.promise(require, _options.extensions).then(this.hitch(function (extensions) {

                        var list = [];

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
                return this._extensions[name];
            },

            /**
             * Pass an extension that has not been started up. Resolves with the started up extension
             *
             * @param ext
             * @returns {altair.Deferred}
             */
            addExtension: function (ext) {

                return ext.startup().then(this.hitch(function (ext) {
                    this._extensions.push(ext);
                    return ext;
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
             * @returns {altair.Deferred}
             */
            extend: function (Module, type) {

                var list = [];

                _.each(this._extensions, function (extension) {
                    if(extension.canExtend(type)) {
                        list.push(extension.extend(Module));
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
             * Run anything you want on an AMD module after it's been created
             *
             * @returns {altair.Deferred}
             */
            execute: function (module, type) {

                if(!module) {
                    return this.inherited(arguments);
                }

                var list = [];

                _.each(this._extensions, function (extension) {
                    if(extension.canExtend(type)) {
                        list.push(extension.execute(module));
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
             * @return {altair.Deferred}
             */
            onWillForgeModule: function (e) {
                return this.extend(e.get('Module'), 'module');
            },

            /**
             * When a module is done being forged (but is not started up) mixin more
             *
             * @param e
             * @returns {altair.Deferred}
             */
            onDidForgeModule: function (e) {
                return this.execute(e.get('module'), 'module');
            }


        });

    });