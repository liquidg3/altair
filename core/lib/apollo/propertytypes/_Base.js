/**
 * Base field type,
 */
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/mixin',
        'lodash'

], function (declare,
             hitch,
             mixin,
             _) {

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
            default: {
                type: 'object',
                options: {
                    label: 'Default value'
                }
            },
            required: {
                type:           'bool',
                options: {
                    label:          'Required',
                    description:    'If this field is required, set to true.',
                    default:    false
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
                    default:   false
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

        constructor: function (options) {

            var _options = mixin(options || {}, this.options, this._defaultOptions);


            if(_options.key) {
                this.key = _options.key;
            }


            if(!this.key) {
                throw new Error('You must set a key for your property type, something like "text" or "bool" or "email".', 'el');
            }

            this.options = _options;
            this.defaultOptionValues = {};

            _.each(this.options, function (property, name) {
                this.defaultOptionValues[name] = _.has(property.options, 'default') ? property.options.default : null;
            }, this);

        },


        /**
         * Will mixin my options into yours. That way you can always get the full set of options
         *
         * @param options
         */
        normalizeOptions: function (options) {

            var newOptions = mixin(this.defaultOptionValues, options || {});

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
            return value;
        },

        noop: function (value) {
            return value;
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
        },

        toDatabaseValue: function (value, options, config) {
            throw new Error('"' + this.key + '" property type must implement toDatabaseValue.');
        },

        validate: function (value, options, config) {

            var errors = [],
                label = options.label || 'value',
                re,
                matches;

            if (options.required && (value === null || value === undefined)) {

                errors.push(
                    label + ' is required.'
                );

            }

            if (options.pattern && value) {

                re = new RegExp(options.pattern);

                if (!re.test(value)) {
                   errors.push(label + ' is invalid.')
                }
            }

            return errors.length > 0 ? errors : true;

        }

    });

});
