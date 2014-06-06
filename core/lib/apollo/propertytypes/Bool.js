define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        key: 'boolean',

        /**
         * Anything truthy to an actual boolean.
         * @param value
         * @param options
         * @param config
         */
        toJsValue: function (value, options, config) {
            return !!value ? true : false;
        },

        toViewValue: function (value, options, config) {
            return (value) ? 'Yes' : 'No';
        },

        toDatabaseValue: function (value, options, config) {
            return this.toJsValue(value, options, config);
        }

    });
});
