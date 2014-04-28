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
            _extensions: null,

            startup: function (options) {

                var _options = options || this.options || {},
                    list     = [],
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

                    list = _options.extensions.map(this.hitch(function (path) {

                        var def = new this.Deferred();

                        require([path], this.hitch(function (Extension) {

                            var extension = new Extension(this);
                            this.addExtension(extension).then(hitch(def, 'resolve')).otherwise(hitch(def, 'reject'));

                        }));

                        return def;
                    }));


                    //wait it out
                    this.deferred = all(list).then(this.hitch(function () {
                        listen();
                        return this;
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
             * Gets you a extension by a particular name
             *
             * @param name
             * @returns {*}
             */
            extension: function (name) {

                var c;

                for( c = 0; c <= this._extensions.length; c++ ) {
                    if( this._extensions[c].name === name ) {

                        return this._extensions[c];
                    }
                }

                return null;
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
                return _.some(this._extensions, function (extension) { return extension.name === name; });
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

                this._extensions.forEach(this.hitch(function (plugin) {
                    if(plugin.canExtend(type)) {
                        list.push(plugin.extend(Module));
                    }
                }));

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

                this._extensions.forEach(this.hitch(function (plugin) {
                    if(plugin.canExtend(type)) {
                        list.push(plugin.execute(module));
                    }
                }));

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
             * When a module is done being forged (but is not started up)
             *
             * @param e
             * @returns {altair.Deferred}
             */
            onDidForgeModule: function (e) {
                return this.execute(e.get('module'), 'module');
            }


        });

    });