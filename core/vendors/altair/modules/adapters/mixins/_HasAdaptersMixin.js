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
 * this.adapter('smtp').then(hitch(this, function (adapter) {
 *      adapter.send(..., ...);
 * }));
 *
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'altair/Lifecycle',
        'altair/events/Emitter',
        'dojo/node!i18n-2',
        'apollo/_HasSchemaMixin'],

    function (declare,
              hitch,
              mixin,
              Lifecycle,
              Emitter,
              i18n,
              _HasSchemaMixin) {


    return declare('altair/modules/adapters/mixins/_HasAdaptersMixin', [Lifecycle, Emitter, _HasSchemaMixin], {

        _manyAdapters:      false,  //can we have many adapters?
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
        startup: function () {

            this.on('register-adapters').then(hitch(this, 'registerAdapters'));

            return this.inherited(arguments).then(hitch(this, function () {

                //if there is a selected adapter, load it first, then set it to our ourselves, then be done
                return (this.values.selectedAdapters && typeof this.values.selectedAdapters[0] === 'string') ? this.adapter(this.values.selectedAdapters[0]).then(hitch(this, function (a) {
                    this.values.selectedAdapters[0] = a;
                    return this;
                })) : this;

            }));
        },

        /**
         * We only read our configs/adapters.json for now, but @TODO is to decide what should go in that json
         *
         * @param e
         * @returns {dojo.Deferred}
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

            var d = new this.Deferred();

            if(!named) {

                if(this.values.selectedAdapters && this.values.selectedAdapters[0]) {

                    //eeeewww, but it beats a mid function return... perhaps restructure this function?
                    d = this.values.selectedAdapters[0];

                } else {
                    d.reject('No ' + this.name + ' adapter selected.');

                }

            }
            //it has been cached
            else if(this._adaptersCache.hasOwnProperty(named)) {

                d.resolve(this._adaptersCache[named]);

            }
            //load it from scratch, then cache
            else {

                this.foundry(named).then(hitch(this, function (adapter) {
                    this._adaptersCache[named] = adapter;
                    d.resolve(adapter);
                })).otherwise(hitch(d, 'reject'));

            }

            return d;

        },

        /**
         * Gets you all adapters registered in the system for your module.
         *
         * @returns {Deferred}
         */
        adapters: function () {

            var d = new this.Deferred();

            if(this._adaptersCache) {
                d.resolve(this._adaptersCache);
            }

            this.emit('register-adapters', {}, function () {
                throw "NOT IMPLEMENTED";
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
                //this makes it easy for someone do decide later to switch between many true & false =)
                schema.append('selectedAdapters', 'nexus', {
                    label: 'Selected Adapters',
                    many:  true
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
         * @param defaultValue
         * @param options
         * @param config
         * @returns {*|Array|Any|Window|Anything|CSS2Properties|String|Number}
         */
        getSelectedAdapter: function (defaultValue, options, config) {

            var _options = mixin(options || {}, { many: false });
            return this.get('selectedAdapters', defaultValue, _options, config);

        }

    });

});
