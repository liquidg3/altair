define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {



    return declare([_Base], {

        key: 'string',
        options: {
            maxLength: {
                type: 'number',
                options: {
                    defaultValue: -1,
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
            var results;

            //get most common check out of the way
            if(typeof value === 'string' && options.maxLength === -1) {
                results = value;

            } else if(typeof value === 'string') {
                results = value.substr(0, options.maxLength);

            } else if(options.maxLength > -1) {
                results = value.toString().substr(0, options.maxLength);

            } else {
                results = value.toString();

            }

            return results;
        }

    });

});
