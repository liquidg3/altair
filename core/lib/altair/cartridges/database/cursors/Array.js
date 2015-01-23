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

        _array:     null,
        _statement: null,
        _index:     0,
        constructor: function (array, statement, total) {
            this._array         = array;
            this._statement     = statement;
            this._total         = total;
        },

        next: function () {

            //we have iterated over all results, none left
            if(this._index >= this.count()) {
                return null;
            }

            var row = this._array[this._index];
            this._index ++;

            return row;

        },

        each: function () {

            var d = new this.Deferred(),
                c = 0,
                all = [],
                run = function () {

                    _.each(this._array, function (row) {
                        d.progress(row);
                    });

                    d.resolve();

                }.bind(this);


            setTimeout(run, 0);

            return d;

        },

        close: function () {

        },

        toArray: function() {
            return this._array;
        },

        count: function () {
            return this._array.length;
        },

        total: function () {
            return this._total || this._array.length;
        },

        statement: function () {
            return this._statement;
        }


    });

});