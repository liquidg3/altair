define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {

    return declare([_Base], {

        key: 'bool',

        /**
         * Anything truthy to an actual boolean.
         * @param value
         * @param options
         * @param config
         */
        toJsValue: function (value, options, config) {

            return value ? true : false;
        }


    });
});
