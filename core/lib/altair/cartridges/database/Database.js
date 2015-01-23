define(['altair/facades/declare',
        '../_Base',
        'altair/facades/all',
        './Statement',
        'lodash'
], function (declare,
             _Base,
             all,
             Statement,
             _) {

    return declare([_Base], {

        name: 'database',
        _connections: null,
        Statement: Statement,
        startup: function (options) {

            var _options    = options || this.options || {},
                list        = [];

            //dependency injection
            this.Statement      = _options.Statement || this.Statement;

            //mix in any adapter types passed (see this.adapterTypes)
            this._connections = [];

            if(_options.connections && !this.altair.safeMode) {

                _.each(_options.connections, function (connection) {

                    var d = this.promise(require, [connection.path]).then(this.hitch(function (Adapter) {
                        var a = new Adapter(this, connection.options);
                        return this.addAdapter(a);

                    }));

                    list.push(d);

                }, this);

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
         * Create a record in you database by a table/collection name
         *
         * @param tableName
         * @returns {altair.cartridges.database.Statement}
         */
        create: function (tableName, options) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().create(tableName, statement.clause('set'), options);
            }));

        },

        /**
         * Create many records at once!
         *
         * @param tableName
         * @returns {altair.cartridges.database.Statement}
         */
        createMany: function (tableName, options) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().createMany(tableName, statement.clause('set'), options);

            }));

        },

        /**
         * Delete records.
         *
         * @param tableName
         * @param options
         * @returns {altair.cartridges.database.query.Query}
         */
        'delete': function (tableName) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().delete(tableName, statement, options);

            }));

        },

        /**
         *
         * @param tableName
         * @param options
         * @returns {altair.cartridges.database.query.Query}
         */
        update: function (tableName) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().update(tableName, statement, options);
            }));

        },

        find: function (tableName) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().find(tableName, statement, options);
            }));

        },

        count: function (tableName) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().count(tableName, statement, options);
            }));

        },

        findOne: function (tableName) {

            return new this.Statement(this.hitch(function (statement, options) {
                return this.defaultConnectionOrThrow().findOne(tableName, statement, options);
            }));

        },

        /**
         * Get a connection by its alias
         *
         * @param alias
         */
        connection: function (alias) {
            return alias ? _.find(this._connections, { alias: alias }) : this.defaultConnection();
        },

        defaultConnection: function () {
            return this._connections[0];
        },

        teardown: function () {

            var list = [];

            _.each(this._connections, function (adapter) {
                list.push(adapter.teardown());
            });

            this.deferred = all(list);

            return this.inherited(arguments);

        },

        defaultConnectionOrThrow: function () {

            var d = this.defaultConnection();

            if(d) {
                return d;
            } else {
                throw new Error('No database connection sent.');
            }

        }


    });

});