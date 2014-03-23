define(['dojo/_base/declare',
        './_Base'],

    function (declare,
              _Base) {


        "use strict";

        return declare([_Base], {

            key: 'select',
            options: {
                multiOptions: {
                    type: 'object',
                    options: {
                        label: 'A key/value pair of options the user can select from.'
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

                } else if(value && options.maxLength > -1) {
                    results = value.toString().substr(0, options.maxLength);

                } else if(value) {
                    results = value.toString();

                }

                return results;
            }

        });

    });
