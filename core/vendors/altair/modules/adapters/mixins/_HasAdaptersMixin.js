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

            this._adaptersCache = {};
        },

        /**
         * Listen to the register-adapters on ourselves.
         *
         * @returns {*}
         */
        startup: function ( options ) {

            this.on('register-adapters').then(this.hitch('registerAdapters'));

            //boot all adapters
            var _options = options || this.options || {};

            if (_options.selectedAdapter) {
                _options.selectedAdapters = [_options.selectedAdapter];
                delete _options.selectedAdapter;
            }

            this.deferred = this.all(_.map(options.selectedAdapters, function (adapter) {

                return this.adapter(adapter);

            }.bind(this))).then(function (adapters) {

                return this;

            }.bind(this));

            return this.inherited(arguments);

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

            if(_.isObject(named) && named.path) {
                options = named.options;
                named   = named.path;
            }

            //no name was passed, assuming first selectedAdapter (only works *after* it has been explicitly called)
            if(!named) {

                if(Object.keys(this._adaptersCache).length > 0) {

                    named = Object.keys(this._adaptersCache)[0];

                } else {

                    named = this.values.selectedAdapters && this.values.selectedAdapters[0];

                }

            }
            //it has been cached
            else if(this._adaptersCache.hasOwnProperty(named)) {

                return this._adaptersCache[named]

            }

            //load the adapter
            if (named && !this._adaptersCache[named]) {

                this.assertString(named, 'Adapter names must be strings.');

                this._adaptersCache[named] = this.forge(named, options, { type: 'adapter' }).then(this.hitch(function (adapter) {
                    this._adaptersCache[named] = adapter;
                    return adapter;
                }));

            }

            return this._adaptersCache[named];

        },

        /**
         * Gets you all adapters registered in the system for your module.
         *
         * @returns {altair.Promise}
         */
        adapters: function () {
            return _.values(this._adaptersCache);
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
            adapter = adapter ? [adapter] : adapter;
            return this.set('selectedAdapters', adapter);
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
