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

                this.deferred = this.parent.forge('models/Valet').then(function (valet) {
                    this._valet = valet;
                }.bind(this));

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
                        colWidths: [20, 10, 80, 10],
                        rows: _.map(results, function (row) {
                            return [ row.name, row.type, row.description, row.score];
                        })
                    });

                }


            }.bind(this)).then(function () {

                return ['selectCommand']; //go back to select command after searching

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

            return this._valet.npm(options).step(this.hitch(function (step) {
                this.writeLine(step.message, step.type);
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
         * Updates everything i find in this package.
         *
         * @param options
         */
        updateFromPackage: function (options) {

            return this.parseConfig(options.packagePath).then(function (config) {

                return this._valet.resolveDependencies(config, options.destination);

            }.bind(this)).step(function (step) {

                this.writeLine(step.message, step.type || 'progress');

            }.bind(this)).then(function (modules) {

                this.writeLine('successfully installed installed ' + modules.length + ' modules', 'success');

            }.bind(this));

        },

        /**
         * Update all of altair
         * @param options
         * @returns {*}
         */
        update: function (options) {

            var altair = this.nexus('Altair');

            if(altair.paths.indexOf('app') > -1) {

                return this._valet.update({
                    destination: 'app'
                }).step(function (step) {

                    this.writeLine(step.message, step.type || 'progress');

                }.bind(this))

            } else {

                this.writeLine('cannot run update. no app present.', 'error');

            }

            return this.this

        },

        /**
         * To override the options for the destination select
         *
         * @param command
         * @returns {*}
         */
        schemaForCommand: function (command) {

            var schema = this.inherited(arguments),
                altair = this.nexus('Altair');

            //the newModule command has some choices that need updating (destination dir)
            if(schema && ['install', 'updateFromPackage'].indexOf(command.callback) > -1) {

                //get the 'paths' we have set in altair
                var altair          = this.nexus('Altair'),
                    defaultValue    = altair.paths.indexOf('app') > -1 ? 'app' : 'home',
                    choices         = {};

                altair.paths.forEach(function (path) {
                    if(path !== 'core') {
                        choices[path] = require.toUrl(path);
                    }
                });

                schema.setOptionFor('destination', 'choices', choices);
                schema.setOptionFor('destination', 'default', defaultValue);

            }

            return schema;
        }


    });
});