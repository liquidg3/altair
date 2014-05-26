/**
 * Mixin that gives any class the power to run as a commander.
 */
define(['altair/facades/declare',
        'altair/facades/mixin',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'lodash',
        '../facades/css'

], function (declare,
             mixin,
             Lifecycle,
             hitch,
             _,
             css) {


    var Commander = declare([Lifecycle], {

        adapter:        null,
        styles:         null,

        startup: function (options) {

            var _options         = mixin(this.options || {}, options || {});

            this.adapter         = (_options && _options.adapter) ? _options.adapter : this.parent.adapter();

            _options.description = (_options && _options.description) ? _options.description : this.name;
            _options.label       = (_options && _options.label) ? _options.label : _options.description;
            _options.foo         = 'bar';

            //error, no adapter set
            if(!this.adapter) {

                this.deferred = new this.Deferred();
                this.deferred.reject('You must pass your commander an adapter from altair:CommandCentral');

                return this.deferred;
            }

            //new options
            arguments[0] = _options;

            return this.inherited(arguments).then(hitch(this, function () {

                var file        = this.parent.resolvePath('commanders/styles.css'),
                    deferred    = new this.Deferred();

                css(file).then(hitch(this, function (styles) {

                    this.styles = styles;

                    deferred.resolve(this);

                    return this;

                })).otherwise(hitch(deferred, 'resolve', this));


                return deferred;

            }));
        },

        /**
         * When this Commander is focused
         */
        focus: function () {},

        /**
         * When blurred (another commander is being focused
         */
        blur: function () {},

        /**
         * Haaaalp
         */
        help: function () {

        },

        /**
         * Render a complex form of properties, use apollo schema flavor
         *
         * @param elements
         * @param options
         * @returns altair.Deferred
         */
        form: function(propertiesOrSchema, options) {

            var apolloSchema = this.nexus('cartridges/Apollo').createSchema(propertiesOrSchema);

            return this.adapter.form(apolloSchema, options);
        },

        /**
         * Build an apollo schema for the command. (TODO handle aliases)
         *
         * @param named
         */
        schemaForCommand: function (command) {

            var schema = this.command(command).schema;

            if(schema) {

                return this.nexus('cartridges/Apollo').createSchema(schema);

            }

            return null;
        },

        /**
         * Will tell us if a certain command by name exists
         *
         * @param named
         * @returns {boolean}
         */
        hasCommand: function (named) {
            return _.has(this.commands(), named);
        },

        /**
         * Description pulled from commanders.json -> description
         * @returns {string}
         */
        description: function () {
            return this.options.description;
        },

        /**
         * Gives you all commands (including aliases) broken out in a helpful way.
         *
         * @param includeAliases
         * @returns {{}}
         */
        commands: function (includeAliases) {

            //get aliases
            var commands = {},
                ia = _.isBoolean(includeAliases) ? includeAliases : true;


            _.each(this.options.commands, function (desc, command) {

                commands[command]           = _.clone(desc);
                commands[command].callback  = command;

                //now aliases
                if(ia) {

                    _.each(desc.aliases || [], function (a) {
                        commands[a] = _.clone(desc);
                        commands[a].isAlias = true;
                        commands[a].callback   = command;
                    });

                }

            });

            return commands;

        },

        /**
         * Gets you details about a command by name.
         *
         * @param named
         * @returns {*}
         */
        command: function (named) {

            if(_.isString(named)) {
                return this.commands()[named];
            } else if(_.has(named, 'callback')) {
                return named;
            } else {
                return null;
            }

        },

        /**
         * Execute a command by name (or alias, I don't care none)
         *
         * @param named
         * @param options
         * @returns {*}
         */
        executeCommand: function (named, options) {

            var c = this.command(named);

            return this[c.callback](options);

        }


    });

    //drop in some delegate methods (passthrough to adapter)
    var methods,
        sig;


    //mix certain adapter methods into the commander for easy access
    methods = ['notice', 'writeLine', 'writeError', 'readLine', 'select', 'showProgress', 'hideProgress', 'splash', 'table'];
    sig     = {};

    methods.forEach(function (method) {
        sig[method] = function () {
            return this.adapter[method].apply(this.adapter, arguments);
        };
    });

    Commander.extend(sig);

    return Commander;

});
