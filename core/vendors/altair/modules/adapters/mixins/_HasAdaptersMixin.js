/**
 * The _HasAdaptersMixin gives your module some very helpful adapter pattern functionality. It works hand-in-hand with
 * config/adapters.json.
 *
 * Events:
 *  register-adapters: Any other module can hook into your event and register their own adapters.
 *
 * Your config should look like this:
 *
 * {
 *      "smtp":"adapters/Smtp",
 *      "pop":"adapters/Pop"
 * }
 *
 * Allowing you to go
 *
 * this.adapter('smtp').then(this.hitch(function (adapter) {
 *      adapter.send(..., ...);
 * }));
 *
 */
define(['altair/facades/declare',
        'altair/facades/mixin',
        'altair/mixins/_AssertMixin',
        'altair/Lifecycle',
        'altair/events/Emitter',
        'dojo/node!i18n-2',
        'lodash',
        'apollo/_HasSchemaMixin'],

    function (declare,
              mixin,
              _AssertMixin,
              Lifecycle,
              Emitter,
              i18n,
              _,
              _HasSchemaMixin) {


    return declare([Lifecycle, Emitter, _HasSchemaMixin, _AssertMixin], {

        _adaptersConfig:    null,   //cache for our adapter's config
        _adaptersCache:     null,   //stores adapters for retrieval later

        constructor: function () {

            this._adaptersCache = [];
        },

        /**
         * Listen to the register-adapters on ourselves.
         *
         * @returns {*}
         */
        startup: function ( options ) {

            this.on('register-adapters').then(this.hitch('registerAdapters'));

            return this.inherited(arguments).then(this.hitch(function () {

                var results = this;

                if(this.values.selectedAdapters[0]) {

                    //if there is a selected adapter, load it first, then set it to our ourselves, then be done
                    results = this.adapter(this.values.selectedAdapters[0]).then(this.hitch(function (a) {

                        if(a) {
                            this.values.selectedAdapters[0] = a;
                        }

                        return this;

                    }));

                }


                return results;

            }));
        },

        /**
         * We only read our configs/adapters.json for now, but @TODO is to decide what should go in that json
         *
         * @param e
         * @returns {altair.Promise}
         */
        registerAdapters: function (e) {
            return this.parseConfig('configs/adapters.json');
        },

        /**
         * Get an adapter by name, if no name is passed it'll be the selected adapter. If you pass no name and selected
         * adapter is returned, no deferred is returned. That is to say, your selected adapter is always available.
         *
         * @param named
         * @returns {Deferred}|{*} a deferred or the selected adapter.
         */
        adapter: function (named) {

            var d = new this.Deferred(),
                options;

            //no name was passed, assuming selectedAdapter (only works *after* startup)
            if(!named) {

                if(this.values.selectedAdapters && this.values.selectedAdapters[0]) {

                    d = this.values.selectedAdapters[0];

                } else {
                    d = null;

                }

            }
            //it has been cached
            else if(this._adaptersCache.hasOwnProperty(named)) {

                d.resolve(this._adaptersCache[named]);

            }
            //load it from scratch, then cache
            else {

                if(_.isObject(named) && named.path) {
                    options = named.options;
                    named   = named.path;
                }

                this.assertString(named, 'Adapter names must be strings.');

                d = this.forge(named, options, { type: 'adapter' }).then(this.hitch(function (adapter) {
                    this._adaptersCache[named] = adapter;
                    return adapter;
                }));

            }

            return d;

        },

        /**
         * Gets you all adapters registered in the system for your module.
         *
         * @returns {altair.Promise}
         */
        adapters: function () {

            var d = new this.Deferred();

            if(this._adaptersCache) {
                d.resolve(this._adaptersCache);
            }

            this.emit('register-adapters', {}, function () {
                throw new Error("NOT IMPLEMENTED");
            });

            return d;

        },

        /**
         * Make sure the schema has a selectedAdapters
         *
         * @param schema
         * @returns {_HasAdaptersMixin}
         */
        setSchema: function (schema) {

            //if there is a schema, lets configure it by adding a "selectedAdapters"
            if(!schema.has('selectedAdapters')) {

                //we will fake the singular version,  get('selectedAdapter'), but always save them as an array
                schema.append('selectedAdapters', 'nexus', {
                    label: 'Selected Adapters',
                    many:  true
                });
            }

            if(!schema.has('selectedAdapter')) {

                schema.append('selectedAdapter', 'nexus', {
                    label: 'Selected Adapter',
                    many:  false
                });

            }

            return this.inherited(arguments);

        },

        /**
         * Alias for setSelectedAdapters
         *
         * @param adapter
         * @returns {_HasSchemaMixin}
         */
        setSelectedAdapter: function (adapter) {
           return this.set('selectedAdapters', [adapter]);
        },

        /**
         * Alias for getSelectedAdapters (always returns the first)
         *
         * @param defaultValue if no adapter(s) set, return default
         * @param options { many: true|false - if results should be an array or not }
         * @param config reserved for future use
         * @returns {*}
         */
        getSelectedAdapter: function (defaultValue, options, config) {

            var _options = mixin(options || {}, { many: false });
            return this.get('selectedAdapters', defaultValue, _options, config);

        }

    });

});
