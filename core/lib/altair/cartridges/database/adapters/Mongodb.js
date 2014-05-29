define(['altair/facades/declare',
    './_Base',
    'altair/plugins/node!mongodb',
    'lodash',
    '../cursors/Mongodb'
], function (declare, _Base, mongodb, _, MongodbCursor) {

    var ObjectId = mongodb.ObjectID;

    return declare([_Base], {

        _client:      null,
        _db:          null,
        writeConcern: 1,
        _operatorMap: {
            '$>':   '$gt',
            '$!=':  '$ne',
            '$!==': '$ne',
            '$<':   '$lt',
            '$>=':  '$gte',
            '$<=':  '$lte',
            '$OR':  '$or'
        },

        _sortMap: {
            'DSC':  -1,
            'DESC': -1,
            'ASC':  1
        },

        startup: function (options) {

            //get options, fallback to default, finally blank obj
            var _options = options || this.options || {},
                connectionString;

            //passthrough of writeconcern
            this.writeConcern = _options.writeConcern || this.writeConcern;

            //did we pass all we needed?
            if (!_options.connectionString) {

                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('The mongodb adapter needs a connectionString.'));

                return this.inherited(arguments); //boo mid-function return (I prefer this to everything in an "else")

            }

            //remove connectionString from options so the remaining options can be passed to the mongo client
            connectionString = _options.connectionString;

            //create a new client
            this._client = new mongodb.MongoClient();

            //let the world know through our cartridge that we are about to connect to the database, give them a chance
            //to make any last minute changes (even in an async way), then continue
            this.deferred = this._cartridge.emit('will-connect-to-database', {
                adapter:          this,
                connectionString: connectionString,
                options:          _options
            }).then(this.hitch(function (e) {

                    //connect to the database (but make a callback based handle into a promise based one)
                    //use the values from the event in case changes have been made
                    return this.promise(this._client, 'connect', e.get('connectionString'), e.get('options'));

                })).then(this.hitch(function (db) {

                    //save the connection locally
                    this._db = db;

                    //let everyone know we just connected and give them a chance to fiddle with things
                    return this._cartridge.emit('did-connect-to-database', {
                        adapter: this
                    });

                })).then(this.hitch(function () {

                    //finally, always end with 'this' for startup()
                    return this;

                }));


            return this.inherited(arguments);

        },

        update: function (collectionName, statement, options) {


            var clauses = this.parseStatement(statement),
                collection = this._db.collection(collectionName),
                where = clauses.where,
                values = clauses.set;

            delete values._id; //no updating id

            return this.promise(collection, 'update', where, { '$set': clauses.set}, options || { w: this.writeConcern }).then(function (results) {
                return results[0];
            });


        },

        create: function (collectionName, document, options) {

            var collection = this._db.collection(collectionName);

            return this.promise(collection, 'insert', [document], options || { w: this.writeConcern }).then(function (results) {
                return results.pop();
            });

        },

        createMany: function (collectionName, documents, options) {

            var collection = this._db.collection(collectionName);

            return this.promise(collection, 'insert', documents, options || { w: this.writeConcern }).then(function (results) {
                return results;
            });


        },

        'delete': function (collectionName, statement, options) {

            var clauses = this.parseStatement(statement),
                collection = this._db.collection(collectionName);

            return this.promise(collection, 'remove', clauses.where || {}, options || { w: this.writeConcern }).then(function (results) {
                return results;
            });

        },

        count: function (collectionName, statement, options) {

            var clauses = this.parseStatement(statement),
                collection = this._db.collection(collectionName);

            return this.promise(collection, 'count', clauses.where || {}, options || { w: this.writeConcern }).then(function (results) {
                return results;
            });

        },

        find: function (collectionName, statement, options) {

            var clauses = this.parseStatement(statement),
                collection = this._db.collection(collectionName),
                where = clauses.where,
                _options = options || {};

            //apply limit clause
            if (_.has(clauses, 'limit')) {
                _options.limit = clauses.limit;
            }

            //apply sort clause
            if (_.has(clauses, 'sort')) {
                _options.sort = clauses.sort;
            }

            //apply skip clause
            if (_.has(clauses, 'skip')) {
                _options.skip = clauses.skip;
            }


            return this.promise(collection, 'find', where || {}, _options).then(function (cursor) {
                return new MongodbCursor(cursor, statement);
            });

        },

        findOne: function (collectionName, statement, options) {

            statement.limit(1);

            return this.find(collectionName, statement, options).then(function (cursor) {
                return cursor.toArray();
            }).then(function (docs) {
                return docs.pop();
            });

        },

        parseStatement: function (statement) {

            var clauses = statement.clauses(),
                mapOperators = this.hitch(function (obj) {

                    var output = _.isArray(obj) ? [] : {};

                    _.each(obj, function (value, key) {

                        var _key = this._operatorMap[key] || key;

                        if (_.isObject(value)) {
                            output[_key] = mapOperators(value);
                        } else {

                            //mongo id?
                            if (_key === '_id') {
                                value = new ObjectId(value);
                            }

                            output[_key] = value;
                        }

                    }, this);

                    return output;
                });

            clauses.where = mapOperators(clauses.where);

            //parse sort
            if(clauses.sort) {

                _.each(clauses.sort, function (value, key) {

                    clauses.sort[key] = _.has(this._sortMap, value) ? this._sortMap[value] : value;

                }, this);
            }

            return clauses;

        },

        teardown: function () {
            return this.promise(this._db, 'close');
        }

    });

});