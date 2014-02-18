/**
 * Mixin that gives any class the power to run as a commander.
 */
define(['dojo/_base/declare',
        'altair/Lifecycle',
        'altair/facades/hitch'

], function (declare,
             Lifecycle,
             hitch) {


    var Commander = declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', [Lifecycle], {

        adapter:    null,
        styles:     null,
        description:  '',

        startup: function (options) {

            options             = options || this.options;
            this.adapter        = (options && options.adapter) ? options.adapter : this.module.adapter();

            options.description = (options && options.description) ? options.description : this.name;

            if(!this.adapter) {
                throw Error('You must pass your commander an adapter from Altair:CommandCentral');
            }

            return this.inherited(arguments).then(hitch(this, function () {

                var file        = this.module.resolvePath('commanders/styles.json'),
                    deferred    = new this.module.Deferred();

                this.module.parseConfig(file).then(hitch(this, function (styles) {

                    this.styles = styles;

                    deferred.resolve(this);

                    return this;

                })).otherwise(hitch(deferred, 'resolve', this));


                return deferred;

            }));
        },

        /**
         * When this Commander is focused, add its styles to the adapter
         */
        focus: function () {

            if(this.styles) {
                this.adapter.addStyles(this.name, this.styles);
            }

        },

        /**
         * When blurred, remove our styles
         */
        blur: function () {

            if(this.styles) {
                this.adapter.removeStyles(this.name);
            }

        },

        help: function () {

        },

        /**
         * Build an apollo schema for the command
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

    });


    //mix certain adapter methods into the commander for easy access
    var methods = ['notice', 'writeLine', 'readLine', 'form', 'select', 'showProgress', 'hideProgress', 'splash'],
        sig     = {};

    methods.forEach(function (method) {
        sig[method] = function () {
            return this.adapter[method].apply(this.adapter, arguments);
        };
    });

    Commander.extend(sig);

    return Commander;

});
