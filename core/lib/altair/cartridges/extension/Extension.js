define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/all',
        'lodash',
        '../_Base'],
    function (declare,
              hitch,
              all,
              _,
              _Base) {


        return declare([_Base], {

            name: 'extension',
            _extensions: [],

            startup: function (options) {

                var _options = options || this.options || {},
                    list     = [];


                /**
                 * Load all extensions
                 */
                if (_options.extensions) {

                    this._extensions = [];

                    list = _options.extensions.map(hitch(this, function (path) {

                        var def = new this.Deferred();

                        require([path], hitch(this, function (extension) {

                            var extension = new extension(this);
                            this.addExtension(extension).then(hitch(def, 'resolve')).otherwise(hitch(def, 'reject'));

                        }));

                        return def;
                    }));

                    //wait it out
                    this.deferred = all(list).then(hitch(this, function () { return this; }));

                }
                //if there are no extensions, we are ready
                else {
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

                return ext.startup().then(hitch(this, function (ext) {
                    this._extensions.push(ext);
                    return ext;
                }));

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
             * Extend the passed AMD module using all the available extensions
             *
             * @param module
             * @returns {*}
             */
            extend: function (module) {

                var list = [];

                this._extensions.forEach(hitch(this, function (plugin) {
                    list.push(plugin.execute(module));
                }));

                if(list.length == 0) {
                    return module;
                }

                return all(list);

            }


        });

    });