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
        _index:     0,
        _callback:  null, //called when the end of results are reached to see if there are more
        constructor: function (array, statement, total, cb) {
            this._array         = array;
            this._statement     = statement;
            this._total         = total;
            this._callback      = cb;
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


                    //now see if there are more results in the _callback
                    if (this._callback) {

                        this.when(this._callback(this)).then(function (cursor) {

                            if (cursor) {

                                this._array     = cursor._array;
                                this._statement = cursor._statement;
                                this._total     = cursor._total;

                                run();

                            } else {
                                d.resolve();
                            }


                        }.bind(this)).otherwise(d.reject.bind(d));

                    } else {

                        d.resolve();

                    }

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
        },

        setTotal: function (total) {
            this._total = total;
        }


    });

});