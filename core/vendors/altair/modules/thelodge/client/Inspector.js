define(['altair/facades/declare',
        'altair/facades/when',
        'altair/facades/all',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'lodash',
        'altair/plugins/node!lunr'
], function (declare,
             when,
             all,
             hitch,
             mixin,
             _,
             lunr) {

    return declare(null, {

        _menuItems:     null,
        _index:         null,
        _docs:          null,

        constructor: function (options) {

            var _options = options || {};

            //did someone pass us a search index we can use?
            if(!_options.index) {

                this._index = lunr(function () {

                    this.ref('id');
                    this.field('name');
                    this.field('description');
                    this.field('keywords', { boost: 10 });

                });

            }
            //pass through search index
            else {
                this._index = _options.index;
            }

            if(_options.menuItems) {
                this.refresh(_options.menuItems);
            }

        },

        /**
         * Builds the search index.
         *
         * @private
         */
        _primeIndex: function () {

            var id = 1;

            this._docs = {}; //our internal store of docs because for some reason the lunr mutates them and makes
                             //it impossible to retrieve exactly what you put in... i know, right? so i keep a local
                             //copy of all documents in the index so they are unmolested. these are grouped by id

            //check each menu
            this._menuItems.forEach(hitch(this, function (doc) {

                var _doc = mixin({ id: id }, doc);

                _doc.score      = 1;// default score given when '*' is used as search term

                //add to internal store for retrieval after search completion
                this._docs[id] = _doc;

                //add to lunr index
                this._index.add(_doc);

                id = id + 1;

            }));

        },

        /**
         * Will update the search index (and probably more things to come)
         *
         * @returns {*}
         */
        refresh: function (menuItems) {
            this._menuItems = menuItems;
            return this._primeIndex();
        },

        /**
         * @param term
         * @param type
         * @param skip
         * @param limit
         * @returns {Deferred}
         */
        search: function (term, type, skip, limit) {

            var d       = new this.Deferred(),
                results = term === '*' ? _.toArray(this._docs) : this._index.search(term).map(hitch(this, function (match) {

                var doc = this._docs[match.ref],
                    copy;

                if(doc) {
                    copy = _.clone(doc);
                    copy.score = match.score;
                }

                return copy;

            }));

            d.resolve(results);

            return d;

        }


    });

});