/**
 * Mixin that gives any class the power to run as a commander.
 */
define(['dojo/_base/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/modules/commandcentral/facades/css'

], function (declare,
             Lifecycle,
             hitch,
             css) {


    var Commander = declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', [Lifecycle], {

        adapter:        null,
        styles:         null,

        startup: function (options) {

            var _options             = options || this.options;

            this.adapter        = (_options && _options.adapter) ? _options.adapter : this.module.adapter();

            _options.description = (_options && _options.description) ? _options.description : this.name;
            _options.label       = (_options && _options.label) ? _options.label : _options.description;

            if(!this.adapter) {
                this.deferred = new this.module.Deferred();
                this.deferred.reject('You must pass your commander an adapter from Altair:CommandCentral');

                return this.deferred;
            }

            return this.inherited(arguments).then(hitch(this, function () {

                var file        = this.module.resolvePath('commanders/styles.css'),
                    deferred    = new this.module.Deferred();

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

        help: function () {

        },

        /**
         * Render a complex form of elements, use apollo schema flavor
         *
         * @param elements
         * @param options
         * @returns altair.Deferred
         */
        form: function(elements, options) {

            var apolloSchema = this.module.nexus('cartridges/Apollo').createSchema({ elements: elements });

            return this.adapter.form(apolloSchema, options);
        },

        /**
         * Build an apollo schema for the command.
         *
         * @param named
         */
        schemaForCommand: function (named) {

            var elements = this.options.commands[named].schema;

            if(elements) {

                return this.nexus('cartridges/Apollo').createSchema({
                   elements: elements
                });

            }

            return null;
        }


    }),
        methods,
        sig;


    //mix certain adapter methods into the commander for easy access
    methods = ['notice', 'writeLine', 'readLine', 'select', 'showProgress', 'hideProgress', 'splash'];
    sig     = {};

    methods.forEach(function (method) {
        sig[method] = function () {
            return this.adapter[method].apply(this.adapter, arguments);
        };
    });

    Commander.extend(sig);

    return Commander;

});
