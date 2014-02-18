define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {



    return declare('apollo/fieldtypes/Str', [_Base], {

        key: 'string',
        options: {
            maxLength: {
                type: 'number',
                options: {
                    value: -1,
                    label: 'Truncate the length of this string to anything you want.'
                }
            }
        },


        /**
         * You shall always get back a string honoring your options.
         *
         * @param value
         * @param options
         * @param config
         * @returns {*}
         */
        toJsValue: function (value, options, config) {

            //get most common check out of the way
            if(typeof value == 'string' && options.maxLength === -1) {
                return value;
            } else if(typeof value === 'string') {
                return value.substr(0, options.maxLength);
            } else if(options.maxLength > -1) {
                return value.toString().substr(0, options.maxLength);
            } else {
                return value.toString();
            }


        }

    });
});
