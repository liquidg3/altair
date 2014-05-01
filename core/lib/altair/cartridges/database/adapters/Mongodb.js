define(['altair/facades/declare',
        './_Base',
        'altair/plugins/node!mongodb'
], function (declare,
             _Base,
             mongodb) {

    return declare([_Base], {

        _client: null,
        _db:     null,
        alias:  '', //we can give our database connections an alias so they are easy to lookup later

        startup: function (options) {

            //get options, fallback to default, finally blank obj
            var _options = options || this.options || {},
                connectionString;

            //was this connection given an alias?
            this.alias    = _options.alias || '';

            if(!this.alias) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('please give your database adapter a nickname.'));

                return this.inherited(arguments); //boo mid-function return (I prefer this to everything in an "else")
            }

            //did we pass all we needed?
            if(!_options.connectionString) {

                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('The mongodb adapter needs a connectionString.'));

                return this.inherited(arguments); //boo mid-function return (I prefer this to everything in an "else")

            }

            //remove connectionString from options so the remaining options can be passed to the mongo client
            connectionString = _options.connectionString;
            delete _options.connectionString;

            //create a new client
            this._client = new mongodb.MongoClient();

            //let the world know through our cartridge that we are about to connect to the database, give them a chance
            //to make any last minute changes (even in an async way), then continue
            this.deferred = this._cartridge.emit('will-connect-to-database', {
                adapter:            this,
                connectionString:   connectionString,
                options:            _options
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

        execute: function (query) {

        },

        teardown: function () {
            return this.promise(this._db, 'close');
        }

    });

});