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
                        colWidths: [20, 10, 60, 10],
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

            return this._valet.install(options.name, options.destination).step(function (step) {
                this.writeLine(step.message);
            }.bind(this)).then(function (modules) {
                this.writeLine(modules.length + ' modules installed', 'success');
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

        },

        /**
         * Get details about an item in the menu
         *
         * @param options
         */
        details: function (options) {

            var menuItem = this._valet.kitchen().menuItemFor(options.name);

            if(!menuItem) {
                this.writeLine('Could not find anything named ' + options.name);
            } else {

                this.table({
                    rows: _.filter(_.map(menuItem, function (value, key) {
                        var r = {};
                        r[key] = value;
                        return r;
                    }), function (row) {
                        return !_.has(row, 'lower') && !_.has(row, 'repository');
                    })
                });

            }


        },

        /**
         * To override the options for the destination select
         *
         * @param named
         * @returns {*}
         */
        schemaForCommand: function (named) {

            var schema = this.inherited(arguments);

            //the newModule command has some choices that need updating (destination dir)
            if(schema && named === 'install') {

                //get the 'paths' we have set in altair
                var altair          = this.nexus('Altair'),
                    choices    = {};

                altair.paths.forEach(function (path) {
                    choices[path] = require.toUrl(path);
                });

                schema.setOptionFor('destination', 'choices', choices);

            }


            return schema;
        }




    });
});