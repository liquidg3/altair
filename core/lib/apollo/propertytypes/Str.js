define(['dojo/_base/declare',
        './_Base',
        'lodash'],

    function (declare,
              _Base,
              _) {



    return declare([_Base], {

        key: 'string',
        options: {
            maxLength: {
                type: 'int',
                options: {
                    default: -1,
                    label: 'Truncate the length of this string to anything you want. -1 means do not trim.'
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

            } else if(!_.isNull(value) && !_.isUndefined(value)) {
                results = value.toString();
            } else {
                results = null;
            }

            return results;
        },

        toDatabaseValue: function (value, options, config) {
            return this.toJsValue(value, options, config);
        }

    });

});
