/**
 * Base field type,
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang'

], function (declare,
             Deferred,
             lang) {

    return declare(null, {

        /**
         * Your field type should define its own options
         */
        options: null,

        /**
         * The values of our options, by default
         */
        defaultOptionValues: null,

        /**
         * Does this field type want its toJsValue, toStringValue, etc. methods to receive
         * only a single value?
         */
        makeValuesSingular: true,

        /**
         * The key for this type, "text" or "bool"
         */
        key: null,

        /**
         * These are options all fields gets (there are really a schema)
         */
        _defaultOptions: {
            label: {
                type: 'text',
                options: {
                    label: 'Label'
                }
            },
            required: {
                type:           'bool',
                options: {
                    label:          'Required',
                    description:    'If this field is required, set to true.',
                    defaultValue:    false
                }
            },
            pattern: {
                type: 'string',
                options: {
                    label: 'Pattern',
                    description: 'Ensure the value set matches this regex'
                }
            },
            many: {
                type: 'bool',
                options: {
                    label:          'Many',
                    description:    'Whether this property should allow more than one value to be attached to it.',
                    defaultValue:   false
                }
            },

            maxValues: {
                type: 'number',
                options: {
                    label: 'Max Values',
                    description: 'If many is true, will the amount of values be capped?'
                }
            },

            minValues: {
                type: 'number',
                options: {
                    label: 'Minimum Values',
                    description: 'The minimum amount of values this property can have. Used for validation.'
                }
            }

        },


        /**
         * How this field type will be rendered if needbe--
         */
        renderer: null,

        constructor: function () {

            if(!this.key) {
                throw new Error('You must set a key for your property type ( ' + this.declaredClass + ' ), something like "text" or "bool" or "email".', 'el');
            }

            //mixin options with default options
            if(!this.options) {
                this.options = {};
            }

            var options = {};

            lang.mixin(options, this.options, this._defaultOptions);

            this.options = options;
            this.defaultOptionValues = {};

            Object.keys(this.options).forEach(lang.hitch(this, function (name) {
                this.defaultOptionValues[name] = this.options[name].options.hasOwnProperty('defaultValue') ? this.options[name].options.defaultValue : null;

            }));

        },

        /**
         * Will mixin my options into yours. That way you can always get the full set of options
         *
         * @param options
         */
        normalizeOptions: function (options) {

            var newOptions = {};
            lang.mixin(newOptions, this.defaultOptionValues, options);

            return newOptions;

        },

        /**
         * Return what everyone expects please =)
         *
         * @param value
         * @param options
         * @param config
         */
        toJsValue: function (value, options, config) {
            throw "toJsValue is not yet implemented in " + this.declaredClass + ".";
        },

        /**
         * Takes any value and normalizes it against the "many" option.
         *
         * @param value
         * @param options
         * @param config
         * @returns {*}
         */
        normalizeMany: function (value, options, config) {

            //we have to make sure it's an array if many is truthy
            if(options.many) {

                if(!(value instanceof Array)) {
                    value = [value];
                }

            } else {

                if(value instanceof Array) {
                    value = value[0];
                }

            }

            return value;
        }

    });

});
