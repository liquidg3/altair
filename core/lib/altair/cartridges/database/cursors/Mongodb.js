define(['altair/facades/declare',
        './_Base',
        'lodash'
], function (declare,
             _Base,
             _) {

    return declare([_Base], {

        _cursor: null,
        _statement: null,
        constructor: function (mongoCursor, statement) {
            this._cursor = mongoCursor;
            this._statement = statement;
        },

        next: function () {
            return this.promise(this._cursor, 'next');
        },

        each: function () {
            return this.promise(this._cursor, 'each');
        },

        close: function () {
            return this.promise(this._cursor, 'close');
        },

        toArray: function() {
            return this.promise(this._cursor, 'toArray');
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