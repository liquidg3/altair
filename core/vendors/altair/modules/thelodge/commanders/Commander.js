define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/facades/hitch',
        'lodash'
], function (declare,
             _IsCommanderMixin,
             hitch,
             _) {

    return declare([_IsCommanderMixin], {

        _valet:  null,
        startup: function (options) {

            var _options = options || this.options;

            if(_options && _options.valet) {

                this._valet = _options.valet;

            } else {

                this.deferred = new this.Deferred();

                this.parent.forge('models/Valet').then(function (valet) {
                    this._valet = valet;
                    this.deferred.resolve(this);
                }.bind(this)).otherwise(this.hitch(this.deferred, 'reject'));

            }

            return this.inherited(arguments);

        },


        /**
         * Search for modules/widgets, etc. You need menus configured, see thelodge/docs/menus.md
         *
         * @param options
         * @returns {altair.Promise}
         */
        search: function (options) {

            return this._valet.search(options.keywords, options.types || 'modules').then(function (results) {

                if(results.length === 0) {

                    this.writeLine('no results found...', 'warning');

                } else {

                    this.writeLine('found ' + results.length + ' result(s) for "' + options.keywords + '"', 'h1');

                    this.table({
                        headers: ['name', 'type', 'description', 'score'],
                        rows: _.map(results, function (row) {
                            return [ row.name, row.type, row.description, row.score];
                        })
                    });

                }


            }.bind(this)).then(function () {

                return ['selectCommand']; //go back to select command

            });

        },

        /**
         * Install something by name
         *
         * @param options
         */
        install: function (options) {

            return this._valet.search(options.name, options.types || 'modules').then(function (results) {

                var match;

                //no matches
                if(results.length === 0) {

                    this.writeLine('no results found...', 'warning');

                }
                //only 1 match
                else if(results.length === 1) {

                    match = results.pop();

                }
                //more than 1 match, select one.
                else {



                }

                return this.when(match);

            }.bind(this));

        },

        /**
         * Run NPM update on all your modules
         *
         * @param options
         * @returns {*}
         */
        npm: function (options) {

            return this._valet.npm(options).step(hitch(this, function (step) {
                this.writeLine(step.message);
            }));

        }



    });
});