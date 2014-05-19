define(['altair/facades/declare',
        './_Base',
        'lodash',
        'altair/facades/all',
        'altair/facades/hitch',
        'altair/facades/when'
], function (declare,
             _Base,
             _,
             all,
             hitch,
             when) {

    return declare([_Base], {

        _cursor: null,
        _statement: null,
        constructor: function (mongoCursor, statement) {
            this._cursor = mongoCursor;
            this._statement = statement;
        },

        next: function () {
            return this.promise(this._cursor, 'next').then(this.hitch(function (document) {

                if(this.foundry) {
                    document._id = document._id.toString();
                    return this.foundry(document);
                } else {
                    return document;
                }

            }));
        },

        each: function () {

            var d = new this.Deferred(),
                c = 0,
                all = [];

            this._cursor.each(this.hitch(function (err, document) {

                if(err) {
                    d.reject(err);
                } else if(document) {

                    var dfd = new this.Deferred();
                    all.push(dfd);

                    c = c + 1;
                    document._id = document._id.toString();

                    if(this.foundry) {
                        when(this.foundry(document)).then(function (entity) {

                            d.progress(entity);

                        }).then(hitch(dfd, 'resolve')).otherwise(hitch(d, 'reject'));

                    } else {
                        dfd.resolve();
                        d.progress(document);
                    }

                } else {

                    this.all(all).then(hitch(d, 'resolve')).otherwise(hitch(d, 'reject'));
                }

            }));

            return d;
        },

        close: function () {
            return this.promise(this._cursor, 'close');
        },

        toArray: function() {
            return this.promise(this._cursor, 'toArray').then(this.hitch(function (documents) {

                if(this.foundry) {

                    var l = _.map(documents, function (document) {
                        document._id = document._id.toString();
                        return this.foundry(document);
                    }, this);

                    return all(l);

                } else {

                    documents = _.map(documents, function (doc) {
                        doc._id = doc._id.toString();
                        return doc;
                    });

                    return documents;
                }

            }));
        },

        count: function () {
            return this.promise(this._cursor, 'count', true);
        },

        total: function () {
            return this.promise(this._cursor, 'count', false);
        },

        statement: function () {
            return this._statement;
        }


    });

});