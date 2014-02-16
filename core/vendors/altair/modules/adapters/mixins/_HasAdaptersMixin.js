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
        'altair/Lifecycle',
        'altair/events/Emitter'],

    function (declare,
              hitch,
              Lifecycle,
              Emitter) {


    return declare('altair/modules/adapters/mixins/_HasAdaptersMixin', [Lifecycle, Emitter], {

        _manyAdapters:      false,  //can we have many adapters?
        _adaptersConfig:    null,   //cache for our adapter's config
        _adaptersCache:     null,   //stores adapters for retrieval later
        _selectedAdapter:   null,   //which adapter is currently selected?
        _selectedAdapters:  null,   //do we have more than one selected? will always be an array if not null

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

            return this.inherited(arguments).then(function (me) {

                //if there is a selected adapter, load it first
                if(typeof me._selectedAdapter === 'string') {
                    return me.adapter();
                }

                return me;
            });
        },

        /**
         * We only read our configs/adapters.json for now, but @TODO is to decide what should go in that json
         *
         * @param e
         * @returns {Deferred}
         */
        registerAdapters: function (e) {

            var d = new this.Deferred();

            this.parseConfig('configs/adapters.json').then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));

            return d;
        },

        /**
         * Get an adapter by name, if no name is passed it'll be the selected adapter. If you pass no name and selected
         * adapter is returned, no deferred is returned. That is to say, your selected adapter is always available.
         *
         * @param named
         * @returns {Deferred}
         */
        adapter: function (named) {

            var d = new this.Deferred();

            if(!named) {

                if(typeof this._selectedAdapter === 'string') {

                    this.adapter(this._selectedAdapter).then(hitch(this, function (adapter) {
                        this._selectedAdapter = adapter;
                        d.resolve(adapter);
                    }));

                } else if(this._selectedAdapter) {
                    return this._selectedAdapter;
                } else {
                    d.reject('No ' + this.name + ' adapter selected.');
                }

            }
            //it has been cached
            else if(named in this._adaptersCache) {

                d.resolve(this._adaptersCache[named]);

            }
            //load it from scratch
            else {

                d = this.foundry(named);
            }

            return d;

        },

        adapters: function () {

            var d = new this.Deferred();

            if(this._adaptersCache) {
                d.resolve(this._adaptersCache);
            }

            this.emit('register-adapters', {}, function () {
                throw "NOT IMPLEMENTED";
            });



            return d;


        }

    });

});
