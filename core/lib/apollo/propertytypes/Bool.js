define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        key: 'boolean',

        options: {
            trueValue: {
                type: 'object',
                options: {
                    label: 'True value',
                    'default': true
                }
            },

            falseValue: {
                type: 'object',
                options: {
                    label: 'False value',
                    'default': false
                }
            }
        },


        /**
         * Anything truthy to an actual boolean.
         * @param value
         * @param options
         * @param config
         */
        toJsValue: function (value, options, config) {
            var coerced = !!value && value !== '0';
            return coerced ? options.trueValue : options.falseValue;
        },

        toViewValue: function (value, options, config) {
            return (this.toJsValue(value, options, config) === options.trueValue) ? 'Yes' : 'No';
        },

        toDatabaseValue: function (value, options, config) {
            return this.toJsValue(value, options, config);
        }

    });
});
