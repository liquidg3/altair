define(['altair/facades/declare',
        '../_Base',
        'altair/facades/mixin',
        'altair/facades/all',
        'altair/facades/hitch',
        'lodash'
], function (declare,
             _Base,
             mixin,
             all,
             hitch,
             _) {

    return declare([_Base], {

        name: 'database',
        _connections: null,

        startup: function (options) {

            var _options    = options || this.options || {},
                list        = [];


            //mix in any adapter types passed (see this.adapterTypes)
            this._connections = [];

            if(_options.connections) {

                _.each(_options.connections, this.hitch(function (connection) {

                    var d = this.promise(require, [connection.path]).then(this.hitch(function (Adapter) {
                        var a = new Adapter(this, connection.options);
                        return this.addAdapter(a);

                    }));

                    list.push(d);

                }), this);

                this.deferred = all(list);

            }

            return this.inherited(arguments);

        },

        /**
         * Pass a newly instantiated adapter and I'll start it up and save it to my internal registry on success.
         *
         * @param adapter
         */
        addAdapter: function (adapter) {

            return adapter.startup().then(this.hitch(function (a) {
                this._connections.push(a);
            }));

        },

        /**
         * Get a connection by its alias
         *
         * @param alias
         */
        connection: function (alias) {

            return _.find(this._connections, { alias: alias });


        },

        teardown: function () {

            var list = [];

            _.each(this._connections, function (adapter) {
                list.push(adapter.teardown());
            });

            this.deferred = all(list);

            return this.inherited(arguments);

        }


    });

});