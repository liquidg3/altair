define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        key: 'object',

        /**
         * Really a simple passthrough
         *
         * @param value
         * @param options
         * @param config
         */
        toJsValue: function (value, options, config) {
            return value;
        },

        toDatabaseValue: function (value, options, config) {
            return this.toJsValue(value, options, config);
        }


    });
});
