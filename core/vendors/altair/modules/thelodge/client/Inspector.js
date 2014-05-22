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

        _installers:    null,
        _menus:         null,
        _index:         null,
        _docs:          null,

        constructor: function (options) {

            //we need installers to know what elements in the menu are valid (modules, widgets, etc.)
            if(!options || !options.installers || !_.isObject(options.installers)) {
                throw new Error('You must pass your inspector some installers. The keys should be types (modules, widgets) and the value should be an instance of the installer.');
            }

            //we search the menus for all the good stuff (modules, widgets, etc.)
            if(!options.menus || !_.isObject(options.menus)) {
                throw new Error('You must pass your inspector some menus. See altair:TheLodge::configs/menu.json for an example.');
            }

            //did someone pass us a search index we can use?
            if(!options.index) {

                this._index = lunr(function () {

                    this.ref('id');
                    this.field('name');
                    this.field('description');
                    this.field('keywords', { boost: 10 });

                });

            }
            //pass through search index
            else {
                this._index = options.index;
            }

            //pass through important bits
            this._installers = options.installers;
            this._menus      = options.menus;

            //prime the index
            this._primeIndex();

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
            this._menus.forEach(hitch(this, function (menu) {

                //only index documents that have a matching installer
                Object.keys(this._installers).forEach(hitch(this, function (type) {

                    var docs = menu[type] || [];

                    docs.forEach(hitch(this, function (doc) {

                        var _doc = mixin({ id: id }, doc);

                        _doc.type       = type;
                        _doc.installer  = this._installers[type];
                        _doc.score      = 1;// default score given when '*' is used as search term

                        //add to internal store
                        this._docs[id] = _doc;

                        //add to lunr index
                        this._index.add(_doc);

                        id = id + 1;

                    }));



                }));

            }));

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